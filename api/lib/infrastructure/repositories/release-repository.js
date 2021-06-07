const _ = require('lodash');
const areaDatasource = require('../datasources/airtable/area-datasource');
const competenceDatasource = require('../datasources/airtable/competence-datasource');
const tubeDatasource = require('../datasources/airtable/tube-datasource');
const skillDatasource = require('../datasources/airtable/skill-datasource');
const challengeDatasource = require('../datasources/airtable/challenge-datasource');
const tutorialDatasource = require('../datasources/airtable/tutorial-datasource');
const courseDatasource = require('../datasources/airtable/course-datasource');
const attachmentDatasource = require('../datasources/airtable/attachment-datasource');
const airtableSerializer = require('../serializers/airtable-serializer');

const { knex } = require('../../../db/knex-database-connection');

module.exports = {
  getCurrentContent() { return _getCurrentContent(); },

  async create(getCurrentContent = _getCurrentContent) {
    const content = await getCurrentContent();
    const release = await knex('releases')
      .returning(['id', 'content', 'createdAt'])
      .insert({ content });

    return release[0];
  },

  async getLatestRelease() {
    const release = await knex('releases')
      .select('id', 'content', 'createdAt')
      .orderBy('createdAt', 'desc')
      .limit(1);

    return release[0];
  },

  async getRelease(id) {
    const release = await knex('releases')
      .select('id', 'content', 'createdAt')
      .where('id', id);

    return release[0];
  },

  async serializeEntity({ entity, type }) {
    const { updatedRecord, model } = airtableSerializer.serialize({
      airtableObject: entity,
      tableName: type
    });

    if (model === attachmentDatasource.path()) {
      const rawChallenge = await challengeDatasource.filterById(updatedRecord.challengeId);
      const attachments = await attachmentDatasource.filterByChallengeId(updatedRecord.challengeId);
      _assignAttachmentsToChallenge(rawChallenge, attachments);
      const challenge = _filterChallengeFields(rawChallenge);
      return { updatedRecord: challenge, model: challengeDatasource.path() };
    }

    if (model === challengeDatasource.path()) {
      const attachments = await attachmentDatasource.filterByChallengeId(updatedRecord.id);
      _assignAttachmentsToChallenge(updatedRecord, attachments);
      const challenge = _filterChallengeFields(updatedRecord);
      return { updatedRecord: challenge, model };
    }

    return { updatedRecord, model };
  },

  assignAttachmentsToChallenges,
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
  ] = await Promise.all([
    areaDatasource.list(),
    competenceDatasource.list(),
    tubeDatasource.list(),
    skillDatasource.list(),
    challengeDatasource.list(),
    tutorialDatasource.list(),
    courseDatasource.list(),
    attachmentDatasource.list(),
  ]);

  let challenges = assignAttachmentsToChallenges(challengesWithoutAttachments, attachments);
  challenges = _filterChallengesFields(challenges);
  return {
    areas,
    competences,
    tubes,
    skills,
    challenges,
    tutorials,
    courses,
  };
}

function _filterChallengesFields(challenges) {
  return challenges.map(_filterChallengeFields);
}

function _filterChallengeFields(challenge) {
  const fieldsToInclude = [
    'id',
    'instruction',
    'proposals',
    'type',
    'solution',
    'solutionToDisplay',
    't1Status',
    't2Status',
    't3Status',
    'scoring',
    'status',
    'skillIds',
    'embedUrl',
    'embedTitle',
    'embedHeight',
    'timer',
    'competenceId',
    'format',
    'autoReply',
    'locales',
    'alternativeInstruction',
    'attachments',
    'illustrationAlt',
    'illustrationUrl',
  ];

  return _.pick(challenge, fieldsToInclude);
}

function _assignAttachmentToChallenge(challenge, attachment) {
  if (attachment.type === 'illustration') {
    challenge.illustrationAlt = attachment.alt;
    challenge.illustrationUrl = attachment.url;
  } else {
    if (!challenge.attachments) {
      challenge.attachments = [];
    }
    challenge.attachments.push(attachment.url);
  }
}

function _assignAttachmentsToChallenge(challenge, attachments) {
  attachments.forEach((attachment) => _assignAttachmentToChallenge(challenge, attachment));
}

function assignAttachmentsToChallenges(challenges, attachments) {
  attachments.forEach((attachment) => {
    const challenge = challenges.find((challenge) => challenge.id === attachment.challengeId);
    _assignAttachmentToChallenge(challenge, attachment);
  });
  return challenges;
}

