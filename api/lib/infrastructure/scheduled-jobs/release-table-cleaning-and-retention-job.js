import { createQueue } from './create-queue.js';
import * as config from '../../config.js';
import { logger } from '../logger.js';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const cjsFile = __dirname + '/release-table-cleaning-and-retention-job-processor.cjs';
const esmFile = __dirname + '/release-table-cleaning-and-retention-job-processor.js';

export async function createReleaseTableCleaningAndRetentionJobQueue() {
  const queue = createQueue('release-table-cleaning-and-retention-queue');
  if (process.env.NODE_ENV === 'test') {
    const module = await import(esmFile);
    queue.process(module.default);
  } else {
    queue.process(cjsFile);
  }
  return queue;
}

const releaseTableCleaningAndRetentionJobOptions = {
  attempts: config.scheduledJobs.attempts,
  backoff: { type: 'exponential', delay: 100 },
  removeOnComplete: true,
  removeOnFail: 1,
  repeat: {
    cron: config.scheduledJobs.cleanReleasesTableTime,
    tz: 'Europe/Paris',
  },
};

export async function schedule() {
  if (!config.scheduledJobs.cleanReleasesTableTime) {
    logger.info(
      'Scheduled releases cleaning and retention is not enabled - check `CLEAN_RELEASES_TABLE_TIME` variable',
    );
    return;
  }
  const queue = await createReleaseTableCleaningAndRetentionJobQueue();
  await queue.add({}, releaseTableCleaningAndRetentionJobOptions);
  return queue;
}
