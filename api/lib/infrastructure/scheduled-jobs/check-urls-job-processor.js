const { validateUrlsFromRelease } = require('../../domain/usecases/validate-urls-from-release');
const logger = require('../../infrastructure/logger');
const { disconnect } = require('../../../db/knex-database-connection');
const releaseRepository = require('../../infrastructure/repositories/release-repository');
const urlErrorRepository = require('../../infrastructure/repositories/url-error-repository');

module.exports = function() {
  return validateUrlsFromRelease({ releaseRepository, urlErrorRepository });
};

async function exitOnSignal(signal) {
  logger.info(`Processor received signal ${signal}. Closing DB connections before exiting.`);
  try {
    await disconnect();
    process.exit(0);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
}

process.on('SIGTERM', () => { exitOnSignal('SIGTERM'); });
process.on('SIGINT', () => { exitOnSignal('SIGINT'); });
