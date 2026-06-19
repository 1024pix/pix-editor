import { createQueue } from './create-queue.js';
import * as config from '../../config.js';
import { fileURLToPath } from 'node:url';
import Queue from 'bull';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const cjsFile = __dirname + '/save-external-urls-job-processor.cjs';
const esmFile = __dirname + '/save-external-urls-job-processor.js';

export async function createSaveExternalUrlsJobQueue() {
  const queue = createQueue('save-external-urls-queue');
  if (process.env.NODE_ENV === 'test') {
    const module = await import(esmFile);
    queue.process(module.default);
  } else {
    queue.process(cjsFile);
  }
  return queue;
}

const checkUrlsJobOptions = {
  attempts: config.scheduledJobs.attempts,
  backoff: { type: 'exponential', delay: 100 },
  removeOnComplete: true,
  removeOnFail: 1,
};

export async function start() {
  const queue = new Queue('save-external-urls-queue', config.scheduledJobs.redisUrl);
  await queue.add({}, checkUrlsJobOptions);
  await queue.close();
}
