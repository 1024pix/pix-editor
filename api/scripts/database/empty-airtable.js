import 'dotenv/config';
import { emptyAllTables as emptyAirtable } from '../../lib/infrastructure/airtable.js';
import { logger } from '../../lib/infrastructure/logger.js';

const isLaunchedFromCommandLine = process.argv[1] === import.meta.filename;
async function main() {
  logger.info('Emptying Airtable base...');
  await emptyAirtable({ showProgression: true });
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
