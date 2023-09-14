import dotenv from 'dotenv';
dotenv.config();
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import { knex, disconnect } from '../db/knex-database-connection.js';
import { logger } from '../lib/infrastructure/logger.js';
import yargs from 'yargs/yargs'

const __filename = fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === __filename;

const argv = yargs(process.argv.slice(2)).version(false).argv;

export async function doSomething({ throwError }) {
  if (throwError) {
    throw new Error('An error occurred');
  }
  logger.info(`Args : ${argv}`);
  const data = await knex.select('id').from('releases').first();
  return data;
};

async function main() {
  const startTime = performance.now();
  logger.info(`Script ${__filename} has started`);
  await doSomething({ throwError: false });
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
