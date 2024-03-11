import { logger } from '../logger.js';
import { disconnect } from '../../../db/knex-database-connection.js';

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

if (process.env.NODE_ENV !== 'test') {
  process.on('SIGTERM', () => { exitOnSignal('SIGTERM'); });
  process.on('SIGINT', () => { exitOnSignal('SIGINT'); });
}
