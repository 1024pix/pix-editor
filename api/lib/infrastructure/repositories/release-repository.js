const areaDatasource = require('../datasources/airtable/area-datasource');
const competenceDatasource = require('../datasources/airtable/competence-datasource');
const tubeDatasource = require('../datasources/airtable/tube-datasource');

module.exports = {
  async getLatest() {
    return {
      areas: await areaDatasource.list(),
      competences: await competenceDatasource.list(),
      tubes: await tubeDatasource.list(),
    };
  }
};
