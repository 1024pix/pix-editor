import 'dotenv/config';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import { disconnect } from '../../db/knex-database-connection.js';
import { logger } from '../../lib/infrastructure/logger.js';
import exportExternalUrlsJobProcessor
  from '../../lib/infrastructure/scheduled-jobs/export-external-url-list-job-processor.js';

const __filename = fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === __filename;

async function exportExternalUrls() {
  return exportExternalUrlsJobProcessor() ;
}

async function main() {
  const startTime = performance.now();
  logger.info(`Script ${__filename} has started`);
  await exportExternalUrls();
  const endTime = performance.now();
  const duration = Math.round(endTime - startTime);
  logger.info(`Script has ended: took ${duration} milliseconds`);
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      logger.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();
