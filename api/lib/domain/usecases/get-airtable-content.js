const areaDatasource = require('../../infrastructure/datasources/airtable/area-datasource');
const competenceDatasource = require('../../infrastructure/datasources/airtable/competence-datasource');
const tubeDatasource = require('../../infrastructure/datasources/airtable/tube-datasource');
const skillDatasource = require('../../infrastructure/datasources/airtable/skill-datasource');
const challengeDatasource = require('../../infrastructure/datasources/airtable/challenge-datasource');
const tutorialDatasource = require('../../infrastructure/datasources/airtable/tutorial-datasource');
const courseDatasource = require('../../infrastructure/datasources/airtable/course-datasource');
const attachmentDatasource = require('../../infrastructure/datasources/airtable/attachment-datasource');
const thematicDatasource = require('../../infrastructure/datasources/airtable/thematic-datasource');

async function getAirtableContent() {
  const [
    areas,
    competences,
    tubes,
    skills,
    challenges,
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

  return {
    areas,
    competences,
    tubes,
    skills,
    challenges,
    tutorials,
    courses,
    attachments,
    thematics,
  };
}

module.exports = {
  getAirtableContent,
};
