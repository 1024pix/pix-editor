const areaDatasource = require('../../infrastructure/datasources/airtable/area-datasource');
const competenceDatasource = require('../../infrastructure/datasources/airtable/competence-datasource');
const tubeDatasource = require('../../infrastructure/datasources/airtable/tube-datasource');
const skillDatasource = require('../../infrastructure/datasources/airtable/skill-datasource');
const challengeDatasource = require('../../infrastructure/datasources/airtable/challenge-datasource');
const tutorialDatasource = require('../../infrastructure/datasources/airtable/tutorial-datasource');
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
    attachments,
    thematics,
  ] = await Promise.all([
    areaDatasource.list(),
    competenceDatasource.list(),
    tubeDatasource.list(),
    skillDatasource.list(),
    challengeDatasource.list(),
    tutorialDatasource.list(),
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
    attachments,
    thematics,
  };
}

module.exports = {
  getAirtableContent,
};
