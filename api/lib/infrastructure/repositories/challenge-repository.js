const challengesDataSource = require('../datasources/airtable/challenge-datasource');

module.exports = {
  async filter(params) {
    if (params && params.ids) {
      return challengesDataSource.filter(params);
    }
    if (params && params.search) {
      return challengesDataSource.search(params.search);
    }
    return challengesDataSource.list();
  },

  create(challenge) {
    return challengesDataSource.create(challenge);
  },

  update(challenge) {
    return challengesDataSource.update(challenge);
  },
};
