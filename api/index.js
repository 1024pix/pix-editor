#!/usr/bin/env node

import { createServer } from './server.js';
import { logger } from './lib/infrastructure/logger.js';
import { createCheckUrlsJobQueue } from './lib/infrastructure/scheduled-jobs/check-urls-job.js';
import { scheduleReleaseJobQueue } from './lib/infrastructure/scheduled-jobs/release-job.js';
import { createUploadTranslationJobQueue } from './lib/infrastructure/scheduled-jobs/upload-translation-job.js';
import { createDeleteUnmentionedKeysAfterUploadJobQueue } from './lib/infrastructure/scheduled-jobs/delete-unmentioned-keys-after-upload-job.js';
import * as exportExternalUrlListJob from './lib/infrastructure/scheduled-jobs/export-external-url-list-job.js';
import * as cleanReleasesJob from './lib/infrastructure/scheduled-jobs/release-table-cleaning-and-retention-job.js';
import { disconnect } from './db/knex-database-connection.js';
import { validateEnvironmentVariables } from './lib/infrastructure/validate-environement-variables.js';
import { JobClient } from './lib/infrastructure/jobs/JobClient.js';
import { JobGroup } from './lib/application/jobs/job-controller.js';

validateEnvironmentVariables();

let checkUrlsJobQueue,
  deleteUnmentionedKeysAfterUploadJobQueue,
  exportExternalUrlListJobQueue,
  releaseJobQueue,
  releaseTableCleaningAndRetentionJobQueue,
  uploadTranslationJobQueue;

async function start() {
  try {
    const server = await createServer();
    await server.start();

    releaseJobQueue = await scheduleReleaseJobQueue();
    uploadTranslationJobQueue = await createUploadTranslationJobQueue();
    deleteUnmentionedKeysAfterUploadJobQueue = await createDeleteUnmentionedKeysAfterUploadJobQueue();
    checkUrlsJobQueue = await createCheckUrlsJobQueue();
    exportExternalUrlListJobQueue = await exportExternalUrlListJob.schedule();
    releaseTableCleaningAndRetentionJobQueue = await cleanReleasesJob.schedule();

    await JobClient.instance.initialize({
      worker: true,
      jobGroups: [JobGroup.DEFAULT],
    });

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
    await checkUrlsJobQueue?.close();
    await releaseJobQueue?.close();
    await uploadTranslationJobQueue?.close();
    await deleteUnmentionedKeysAfterUploadJobQueue?.close();
    await exportExternalUrlListJobQueue?.close();
    await releaseTableCleaningAndRetentionJobQueue?.close();
    await JobClient.instance.stop();
    process.exit(0);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
}

process.on('SIGTERM', () => {
  exitOnSignal('SIGTERM');
});
process.on('SIGINT', () => {
  exitOnSignal('SIGINT');
});

start();
