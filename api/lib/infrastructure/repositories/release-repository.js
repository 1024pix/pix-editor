const areaDatasource = require('../datasources/airtable/area-datasource');
const competenceDatasource = require('../datasources/airtable/competence-datasource');
const tubeDatasource = require('../datasources/airtable/tube-datasource');
const skillDatasource = require('../datasources/airtable/skill-datasource');
const challengeDatasource = require('../datasources/airtable/challenge-datasource');
const tutorialDatasource = require('../datasources/airtable/tutorial-datasource');
const courseDatasource = require('../datasources/airtable/course-datasource');
const attachmentDatasource = require('../datasources/airtable/attachment-datasource');
const thematicDatasource = require('../datasources/airtable/thematic-datasource');
const airtableSerializer = require('../serializers/airtable-serializer');
const challengeTransformer = require('../transformers/challenge-transformer');
const competenceTransformer = require('../transformers/competence-transformer');
const skillTransformer = require('../transformers/skill-transformer');
const courseTransformer = require('../transformers/course-transformer');
const tutorialTransformer = require('../transformers/tutorial-transformer');
const Release = require('../../domain/models/Release');
const Content = require('../../domain/models/Content');

const { knex } = require('../../../db/knex-database-connection');

module.exports = {
  getCurrentContent() { return _getCurrentContent(); },

  async create(getCurrentContent = _getCurrentContent) {
    const content = await getCurrentContent();
    const release = await knex('releases')
      .returning(['id', 'content', 'createdAt'])
      .insert({ content });

    return this.toDomain(release[0]);
  },

  async getLatestRelease() {
    const release = await knex('releases')
      .select('id', 'content', 'createdAt')
      .orderBy('createdAt', 'desc')
      .limit(1);

    return this.toDomain(release[0]);
  },

  async getRelease(id) {
    const release = await knex('releases')
      .select('id', 'content', 'createdAt')
      .where('id', id);

    return this.toDomain(release[0]);
  },

  async serializeEntity({ entity, type }) {
    const { updatedRecord, model } = airtableSerializer.serialize({
      airtableObject: entity,
      tableName: type
    });

    if (model === attachmentDatasource.path()) {
      const rawChallenge = await challengeDatasource.filterById(updatedRecord.challengeId);
      const attachments = await attachmentDatasource.filterByChallengeId(updatedRecord.challengeId);
      const learningContent = {
        attachments,
      };
      const transformChallenge = challengeTransformer.createChallengeTransformer(learningContent);
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

  toDomain(releaseDTO) {
    if (!releaseDTO) {
      return null;
    }
    return new Release({
      id: releaseDTO.id,
      content: Content.from(releaseDTO.content),
      createdAt: releaseDTO.createdAt,
    });
  }
};

async function _getCurrentContent() {
  const [
    areas,
    competences,
    tubes,
    skills,
    challengesWithoutAttachments,
    tutorials,
    courses,
    attachments,
    thematics,
  ] = await Promise.all([
    areaDatasource.list(),
    competenceDatasource.list(),
    tubeDatasource.list(),
    skillDatasource.list(),
    challengeDatasource.list(),
    tutorialDatasource.list(),
    courseDatasource.list(),
    attachmentDatasource.list(),
    thematicDatasource.list(),
  ]);
  const learningContent = {
    areas,
    competences,
    tubes,
    skills,
    challengesWithoutAttachments,
    tutorials,
    courses,
    attachments,
    thematics,
  };
  const transformChallenge = challengeTransformer.createChallengeTransformer(learningContent);
  const challenges = challengesWithoutAttachments.map(transformChallenge);

  const filteredCompetences = competenceTransformer.filterCompetencesFields(competences);
  const filteredSkills = skillTransformer.filterSkillsFields(skills);
  const filteredCourses = courseTransformer.filterCoursesFields(courses);
  const filteredTutorials = tutorialTransformer.filterTutorialsFields(tutorials);

  return {
    areas,
    competences: filteredCompetences,
    tubes,
    skills: filteredSkills,
    challenges,
    tutorials: filteredTutorials,
    courses: filteredCourses,
    thematics,
  };
}
