import 'dotenv/config';
import { fileURLToPath } from 'node:url';
import { emptyAllTables as emptyAirtable } from '../../lib/infrastructure/airtable.js';
import { logger } from '../../lib/infrastructure/logger.js';

const __filename = fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === __filename;
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
