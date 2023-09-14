import { createQueue } from './create-queue.js';
import * as config from '../../config.js';
import { logger } from '../logger.js';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export const queue = createQueue('create-release-queue');
const cjsFile = __dirname + '/release-job-processor.cjs';
const esmFile = __dirname + '/release-job-processor.js';
if (process.env.NODE_ENV === 'test') {
  import(esmFile).then((module) => {
    queue.process(module.default);
  });
} else {
  queue.process(cjsFile);
}

const releaseJobOptions = {
  attempts: config.scheduledJobs.attempts,
  backoff: { type: 'exponential', delay: 100 },
  removeOnComplete: true,
  removeOnFail: 1,
  repeat: {
    cron: config.scheduledJobs.createReleaseTime,
    tz: 'Europe/Paris',
  },
};

export function schedule() {
  if (!_isScheduledReleaseEnabled()) {
    logger.info('Scheduled release is not enabled - check `CREATE_RELEASE_TIME` and `REDIS_URL` variables');
    return;
  }
  queue.add({}, releaseJobOptions);
}

function _isScheduledReleaseEnabled() {
  return config.scheduledJobs.createReleaseTime && config.scheduledJobs.redisUrl;
}
