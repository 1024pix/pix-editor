import { createQueue } from './create-queue.js';
import * as config from '../../config.js';
import { logger } from '../logger.js';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export const queue = createQueue('release-table-cleaning-and-retention-queue');
const cjsFile = __dirname + '/release-table-cleaning-and-retention-job-processor.cjs';
const esmFile = __dirname + '/release-table-cleaning-and-retention-job-processor.js';
if (process.env.NODE_ENV === 'test') {
  import(esmFile).then((module) => {
    queue.process(module.default);
  });
} else {
  queue.process(cjsFile);
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

export function schedule() {
  if (!config.scheduledJobs.cleanReleasesTableTime) {
    logger.info(
      'Scheduled releases cleaning and retention is not enabled - check `CLEAN_RELEASES_TABLE_TIME` variable',
    );
    return;
  }
  queue.add({}, releaseTableCleaningAndRetentionJobOptions);
}
