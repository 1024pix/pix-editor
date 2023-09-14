import { validateUrlsFromRelease } from '../../domain/usecases/validate-urls-from-release.js';
import { logger } from '../logger.js';
import { disconnect } from '../../../db/knex-database-connection.js';
import { releaseRepository, urlErrorRepository } from '../repositories/index.js';

export default function checkUrlsJobProcessor() {
  return validateUrlsFromRelease({ releaseRepository, urlErrorRepository });
}

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
