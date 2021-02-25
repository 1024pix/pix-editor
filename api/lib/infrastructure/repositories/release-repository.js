const areaDatasource = require('../datasources/airtable/area-datasource');
const competenceDatasource = require('../datasources/airtable/competence-datasource');
const tubeDatasource = require('../datasources/airtable/tube-datasource');
const skillDatasource = require('../datasources/airtable/skill-datasource');
const challengeDatasource = require('../datasources/airtable/challenge-datasource');
const tutorialDatasource = require('../datasources/airtable/tutorial-datasource');
const courseDatasource = require('../datasources/airtable/course-datasource');

const { knex } = require('../../../db/knex-database-connection');

const pixApiClient = require('../pix-api-client');
const createdReleaseNotifier = require('../event-notifier/created-release-notifier');

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

    await createdReleaseNotifier.notify({ pixApiClient });

    return release[0];
  },

  async getLatestRelease() {
    const release = await knex('releases')
      .select('id', 'content', 'createdAt')
      .orderBy('createdAt', 'desc')
      .limit(1);

    return release[0];
  }
};

async function _getCurrentContent() {
  const [
    areas,
    competences,
    tubes,
    skills,
    challenges,
    tutorials,
    courses
  ] = await Promise.all([
    areaDatasource.list(),
    competenceDatasource.list(),
    tubeDatasource.list(),
    skillDatasource.list(),
    challengeDatasource.list(),
    tutorialDatasource.list(),
    courseDatasource.list()
  ]);
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
