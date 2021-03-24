const areaDatasource = require('../datasources/airtable/area-datasource');
const competenceDatasource = require('../datasources/airtable/competence-datasource');
const tubeDatasource = require('../datasources/airtable/tube-datasource');
const skillDatasource = require('../datasources/airtable/skill-datasource');
const challengeDatasource = require('../datasources/airtable/challenge-datasource');
const tutorialDatasource = require('../datasources/airtable/tutorial-datasource');
const courseDatasource = require('../datasources/airtable/course-datasource');
const attachmentDatasource = require('../datasources/airtable/attachment-datasource');

const { knex } = require('../../../db/knex-database-connection');

module.exports = {
  getCurrentContentAsStream(writableStream) {
    const timer = setInterval(() => {
      writableStream.write('\n');
    }, 1000);
    _getCurrentContent().then(
      (data) => {
        writableStream.write(JSON.stringify(data));
        clearInterval(timer);
        writableStream.end();
      }
    ).catch(() => {
      clearInterval(timer);
      writableStream.write('error');
      writableStream.end();
    });
    return writableStream;
  },

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

  const challenges = assignAttachmentsToChallenges(challengesWithoutAttachments, attachments);

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

function assignAttachmentsToChallenges(challenges, attachments) {
  attachments.forEach((attachment) => {
    const challenge = challenges.find((challenge) => challenge.id === attachment.challengeId);

    if (attachment.type === 'illustration') {
      challenge.illustrationAlt = attachment.alt;
      challenge.illustrationUrl = attachment.url;
    } else {
      if (!challenge.attachments) {
        challenge.attachments = [];
      }
      challenge.attachments.push(attachment.url);
    }
  });
  return challenges;
}

