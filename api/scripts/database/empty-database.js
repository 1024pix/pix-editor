import 'dotenv/config';
import { emptyAllTables as emptyPG } from '../../db/knex-database-connection.js';
import { logger } from '../../lib/infrastructure/logger.js';

const isLaunchedFromCommandLine = process.argv[1] === import.meta.filename;
async function main() {
  logger.info('Emptying all POSTGRESQL tables...');
  await emptyPG();
  logger.info('Done!');
  process.exit(0);
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      logger.error(error);
      process.exitCode = 1;
    }
  }
})();
