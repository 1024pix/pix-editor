const areaDatasource = require('../datasources/airtable/area-datasource');
const attachmentDatasource = require('../datasources/airtable/attachment-datasource');
const challengeDatasource = require('../datasources/airtable/challenge-datasource');
const competenceDatasource = require('../datasources/airtable/competence-datasource');
const frameworkDatasource = require('../datasources/airtable/framework-datasource');
const skillDatasource = require('../datasources/airtable/skill-datasource');
const thematicDatasource = require('../datasources/airtable/thematic-datasource');
const tubeDatasource = require('../datasources/airtable/tube-datasource');
const tutorialDatasource = require('../datasources/airtable/tutorial-datasource');
const airtableSerializer = require('../serializers/airtable-serializer');
const challengeTransformer = require('../transformers/challenge-transformer');
const competenceTransformer = require('../transformers/competence-transformer');
const tubeTransformer = require('../transformers/tube-transformer');
const skillTransformer = require('../transformers/skill-transformer');
const tutorialTransformer = require('../transformers/tutorial-transformer');
const Release = require('../../domain/models/Release');
const Content = require('../../domain/models/Content');

const { knex } = require('../../../db/knex-database-connection');

module.exports = {
  getCurrentContent() {
    return _getCurrentContent();
  },

  async create(getCurrentContent = _getCurrentContent) {
    const content = await getCurrentContent();
    const release = await knex('releases')
      .insert({ content }, ['id']);

    return release[0].id;
  },

  async getLatestRelease() {
    const release = await knex('releases')
      .select('id', 'content', 'createdAt')
      .orderBy('createdAt', 'desc')
      .limit(1);

    return _toDomain(release[0]);
  },

  async getRelease(id) {
    const release = await knex('releases')
      .select('id', 'content', 'createdAt')
      .where('id', id);

    return _toDomain(release[0]);
  },

  async serializeEntity({ entity, type }) {
    const { updatedRecord, model } = airtableSerializer.serialize({
      airtableObject: entity,
      tableName: type
    });

    if (model === attachmentDatasource.path()) {
      const rawChallenge = await challengeDatasource.filterById(updatedRecord.challengeId);
      const attachments = await attachmentDatasource.filterByChallengeId(updatedRecord.challengeId);
      const transformChallenge = challengeTransformer.createChallengeTransformer({ attachments });
      const challenge = transformChallenge(rawChallenge);

      return { updatedRecord: challenge, model: challengeDatasource.path() };
    }

    if (model === challengeDatasource.path()) {
      const attachments = await attachmentDatasource.filterByChallengeId(updatedRecord.id);
      const learningContent = {
        attachments,
      };
      const transformChallenge = challengeTransformer.createChallengeTransformer(learningContent);
      const challenge = transformChallenge(updatedRecord);

      return { updatedRecord: challenge, model };
    }

    return { updatedRecord, model };
  },
};

function _toDomain(releaseDTO) {
  if (!releaseDTO) {
    return null;
  }
  return new Release({
    id: releaseDTO.id,
    content: Content.buildForRelease(releaseDTO.content),
    createdAt: releaseDTO.createdAt,
  });
}

async function _getCurrentContent() {
  const airtableChallenges = await challengeDatasource.list();
  const [currentContentFromAirtable, currentContentFromPG] = await Promise.all([
    _getCurrentContentFromAirtable(airtableChallenges),
    _getCurrentContentFromPG(airtableChallenges),
  ]);
  return {
    ...currentContentFromAirtable,
    ...currentContentFromPG
  };
}

async function _getCurrentContentFromAirtable(challenges) {
  const [
    areas,
    attachments,
    competences,
    frameworks,
    skills,
    thematics,
    tubes,
    tutorials,
  ] = await Promise.all([
    areaDatasource.list(),
    attachmentDatasource.list(),
    competenceDatasource.list(),
    frameworkDatasource.list(),
    skillDatasource.list(),
    thematicDatasource.list(),
    tubeDatasource.list(),
    tutorialDatasource.list(),
  ]);
  const transformChallenge = challengeTransformer.createChallengeTransformer({ attachments });
  const transformedChallenges = challenges.map(transformChallenge);
  const transformedTubes = tubeTransformer.transform({ tubes, skills, challenges: transformedChallenges, thematics });
  const filteredCompetences = competenceTransformer.filterCompetencesFields(competences);
  const filteredSkills = skillTransformer.filterSkillsFields(skills);
  const filteredTutorials = tutorialTransformer.filterTutorialsFields(tutorials);

  return {
    frameworks,
    areas,
    competences: filteredCompetences,
    thematics,
    tubes: transformedTubes,
    skills: filteredSkills,
    challenges: transformedChallenges,
    tutorials: filteredTutorials,
  };
}

async function _getCurrentContentFromPG(airtableChallenges) {
  const staticCoursesDTO = await knex('static_courses')
    .select(['id', 'name', 'description', 'isActive', 'challengeIds', 'imageUrl'])
    .orderBy('id');
  return {
    courses: staticCoursesDTO.map(({ id, name, description, isActive, challengeIds, imageUrl }) => {
      const challenges = challengeIds.replaceAll(' ', '').split(',');
      const competences = challenges.map((challengeId) => {
        return airtableChallenges.find((airtableChallenge) => airtableChallenge.id === challengeId).competenceId;
      });
      return {
        id,
        name,
        description,
        isActive,
        challenges,
        competences,
        imageUrl,
      };
    }),
  };
}
