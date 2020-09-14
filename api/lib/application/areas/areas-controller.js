const usecases = require('../../domain/usecases');

module.exports = {

  async get() {
    return usecases.getAreas();
  },
};
