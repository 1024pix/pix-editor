const areaDatasource = require('../datasources/airtable/area-datasource');
const competenceDatasource = require('../datasources/airtable/competence-datasource');
const tubeDatasource = require('../datasources/airtable/tube-datasource');
const skillDatasource = require('../datasources/airtable/skill-datasource');
const challengeDatasource = require('../datasources/airtable/challenge-datasource');

module.exports = {
  async getLatest() {
    return {
      areas: await areaDatasource.list(),
      competences: await competenceDatasource.list(),
      tubes: await tubeDatasource.list(),
      skills: await skillDatasource.list(),
      challenges: await challengeDatasource.list(),
    };
  }
};
