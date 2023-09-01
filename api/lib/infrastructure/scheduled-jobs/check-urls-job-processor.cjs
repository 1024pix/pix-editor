const { validateUrlsFromRelease } = await import('../../domain/usecases/validate-urls-from-release.js');
const { logger } = await import('../logger.js');
const { disconnect } = await import('../../../db/knex-database-connection.js');
const { releaseRepository, urlErrorRepository } = await import('../repositories/index.js');

module.exports = function checkUrlsJobProcessor() {
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
