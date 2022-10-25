const areaDatasource = require('../datasources/airtable/area-datasource');
const attachmentDatasource = require('../datasources/airtable/attachment-datasource');
const challengeDatasource = require('../datasources/airtable/challenge-datasource');
const competenceDatasource = require('../datasources/airtable/competence-datasource');
const courseDatasource = require('../datasources/airtable/course-datasource');
const frameworkDatasource = require('../datasources/airtable/framework-datasource');
const skillDatasource = require('../datasources/airtable/skill-datasource');
const thematicDatasource = require('../datasources/airtable/thematic-datasource');
const tubeDatasource = require('../datasources/airtable/tube-datasource');
const tutorialDatasource = require('../datasources/airtable/tutorial-datasource');
const airtableSerializer = require('../serializers/airtable-serializer');
const challengeTransformer = require('../transformers/challenge-transformer');
const competenceTransformer = require('../transformers/competence-transformer');
const tubeTransformer = require('../transformers/tube-transformer');
const courseTransformer = require('../transformers/course-transformer');
const skillTransformer = require('../transformers/skill-transformer');
const tutorialTransformer = require('../transformers/tutorial-transformer');
const Release = require('../../domain/models/Release');
const Content = require('../../domain/models/Content');

const { knex } = require('../../../db/knex-database-connection');

module.exports = {
  getCurrentContent() { return _getCurrentContent(); },

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
  const [
    areas,
    attachments,
    challenges,
    competences,
    courses,
    frameworks,
    skills,
    thematics,
    tubes,
    tutorials,
  ] = await Promise.all([
    areaDatasource.list(),
    attachmentDatasource.list(),
    challengeDatasource.list(),
    competenceDatasource.list(),
    courseDatasource.list(),
    frameworkDatasource.list(),
    skillDatasource.list(),
    thematicDatasource.list(),
    tubeDatasource.list(),
    tutorialDatasource.list(),
  ]);
  const transformChallenge = challengeTransformer.createChallengeTransformer({ attachments });
  const transformedChallenges = challenges.map(transformChallenge);
  const transformedTubes = tubeTransformer.transform({ tubes, skills, challenges: transformedChallenges });
  const filteredCompetences = competenceTransformer.filterCompetencesFields(competences);
  const filteredSkills = skillTransformer.filterSkillsFields(skills);
  const filteredCourses = courseTransformer.filterCoursesFields(courses);
  const filteredTutorials = tutorialTransformer.filterTutorialsFields(tutorials);

  return {
    frameworks,
    areas,
    competences: filteredCompetences,
    thematics,
    tubes: transformedTubes,
    skills: filteredSkills,
    challenges: transformedChallenges,
    courses: filteredCourses,
    tutorials: filteredTutorials,
  };
}
