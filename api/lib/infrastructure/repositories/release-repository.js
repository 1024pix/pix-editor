const areaDatasource = require('../datasources/airtable/area-datasource');
const competenceDatasource = require('../datasources/airtable/competence-datasource');

module.exports = {
  async getLatest() {
    return {
      areas: await areaDatasource.list(),
      competences: await competenceDatasource.list(),
    };
  }
};
