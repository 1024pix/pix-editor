const challengesDataSource = require('../datasources/airtable/challenge-datasource');

module.exports = {
  async filter()  {
    return challengesDataSource.list();
  }
};
