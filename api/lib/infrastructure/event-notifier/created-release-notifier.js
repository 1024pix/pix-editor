const logger = require('../logger');

module.exports = {
  async notify({ pixApiClient  }) {
    try {
      await pixApiClient.request({ url: '/api/cache/' });
    } catch (error) {
      logger.error(error, 'Notifiying about release creation failed');
    }
  }
};
