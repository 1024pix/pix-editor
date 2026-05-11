import { createQueue } from './create-queue.js';
import * as config from '../../config.js';
import { logger } from '../logger.js';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const cjsFile = __dirname + '/export-external-url-list-job-processor.cjs';
const esmFile = __dirname + '/export-external-url-list-job-processor.js';

export async function createExportExternalUrlListJobQueue() {
  const queue = createQueue('export-external-url-list-queue');
  if (process.env.NODE_ENV === 'test') {
    const module = await import(esmFile);
    queue.process(module.default);
  } else {
    queue.process(cjsFile);
  }
  return queue;
}

const externalUrlJobOptions = {
  attempts: config.scheduledJobs.attempts,
  backoff: { type: 'exponential', delay: 100 },
  removeOnComplete: true,
  removeOnFail: 1,
  repeat: {
    cron: config.scheduledJobs.exportExternalUrlListTime,
    tz: 'Europe/Paris',
  },
};

export async function schedule() {
  if (!_isScheduledExportEnabled()) {
    logger.info(
      'Scheduled export of external list is not enabled - check `EXPORT_EXTERNAL_URL_LIST_TIME` and `REDIS_URL` variables',
    );
    return;
  }
  const queue = await createExportExternalUrlListJobQueue();
  await queue.add({}, externalUrlJobOptions);
  return queue;
}

function _isScheduledExportEnabled() {
  return config.scheduledJobs.exportExternalUrlListTime && config.scheduledJobs.redisUrl;
}
