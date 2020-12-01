const areaDatasource = require('../datasources/airtable/area-datasource');
const competenceDatasource = require('../datasources/airtable/competence-datasource');
const tubeDatasource = require('../datasources/airtable/tube-datasource');
const skillDatasource = require('../datasources/airtable/skill-datasource');
const challengeDatasource = require('../datasources/airtable/challenge-datasource');
const tutorialDatasource = require('../datasources/airtable/tutorial-datasource');
const courseDatasource = require('../datasources/airtable/course-datasource');

module.exports = {
  getLatestAsStream(writableStream) {
    const timer = setInterval(() => {
      writableStream.write('\n');
    }, 1000);
    _getLatest().then(
      (data) => {
        writableStream.write(JSON.stringify(data));
        clearInterval(timer);
        writableStream.end();
      }
    ).catch((err) => {
      clearInterval(timer);
      writableStream.write('error');
      writableStream.end();
    });
    return writableStream;
  },
};

async function _getLatest() {
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
