const releaseJob = require('./lib/infrastructure/scheduled-jobs/release-job');
const logger = require('./lib/infrastructure/logger');
const { queue: checkUrlQueue } = require('./lib/infrastructure/scheduled-jobs/check-urls-job');
const validateEnvironmentVariables = require('./lib/infrastructure/validate-environement-variables');

const main = async () => {
  validateEnvironmentVariables();
  try {
    releaseJob.schedule();
    logger.info('Scheduler has been started');
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};
async function exitOnSignal(signal) {
  logger.info(`Received signal ${signal}. Closing queues before exiting.`);
  try {
    await checkUrlQueue.close();
    await releaseJob.queue.close();
    process.exit(0);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
}

process.on('SIGTERM', () => { exitOnSignal('SIGTERM'); });
process.on('SIGINT', () => { exitOnSignal('SIGINT'); });

main();
