const challengesDataSource = require('../datasources/airtable/challenge-datasource');

module.exports = {
  async filter(params) {
    return (params && params.ids)
      ? challengesDataSource.filter(params)
      : challengesDataSource.list();
  },

  create(challenge) {
    return challengesDataSource.create(challenge);
  },
};
