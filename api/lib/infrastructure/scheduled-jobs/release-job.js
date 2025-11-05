import { createQueue } from './create-queue.js';
import * as config from '../../config.js';
import { logger } from '../logger.js';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const cjsFile = __dirname + '/release-job-processor.cjs';
const esmFile = __dirname + '/release-job-processor.js';

export function createReleaseJobQueue() {
  const queue = createQueue('create-release-queue');
  if (process.env.NODE_ENV === 'test') {
    import(esmFile).then((module) => {
      queue.process(module.default);
    });
  } else {
    queue.process(cjsFile);
  }
  return queue;
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

export function scheduleReleaseJobQueue() {
  const isScheduledReleaseEnabled = config.scheduledJobs.createReleaseTime && config.scheduledJobs.redisUrl;

  if (!isScheduledReleaseEnabled) {
    logger.info('Scheduled release is not enabled - check `CREATE_RELEASE_TIME` and `REDIS_URL` variables');
    return;
  }

  const queue = createReleaseJobQueue();
  queue.add({}, releaseJobOptions);
  return queue;
}
