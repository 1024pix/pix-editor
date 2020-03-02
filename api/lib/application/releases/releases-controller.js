const usecases = require('../../domain/usecases');

module.exports = {

  async post(request, h) {
    const release = await usecases.createRelease();
    return h.response(release).created();
  },
};
