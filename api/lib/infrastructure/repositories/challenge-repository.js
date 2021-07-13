const challengesDataSource = require('../datasources/airtable/challenge-datasource');

module.exports = {
  async filter(params = {}) {
    if (params.filter && params.filter.ids) {
      return challengesDataSource.filter(params);
    }
    if (params.filter && params.filter.search) {
      return challengesDataSource.search(params);
    }
    return challengesDataSource.list(params);
  },

  create(challenge) {
    return challengesDataSource.create(challenge);
  },

  update(challenge) {
    return challengesDataSource.update(challenge);
  },
};
