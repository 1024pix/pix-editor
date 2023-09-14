#!/usr/bin/env node

import { createServer } from './server.js';
import { logger } from './lib/infrastructure/logger.js';
import { queue as checkUrlQueue } from './lib/infrastructure/scheduled-jobs/check-urls-job.js';
import * as releaseJob from './lib/infrastructure/scheduled-jobs/release-job.js';
import { disconnect } from './db/knex-database-connection.js';
import { validateEnvironmentVariables } from './lib/infrastructure/validate-environement-variables.js';

validateEnvironmentVariables();

async function start() {
  try {
    const server = await createServer();
    await server.start();

    releaseJob.schedule();

    logger.info('Server running at %s', server.info.uri);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
}

async function exitOnSignal(signal) {
  logger.info(`Received signal ${signal}. Closing DB connections and queues before exiting.`);
  try {
    await disconnect();
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

start();
