import { createQueue } from './create-queue.js';
import * as config from '../../config.js';
import { fileURLToPath } from 'node:url';
import Queue from 'bull';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const esmFile = __dirname + '/upload-translation-job-processor.js';
const cjsFile = __dirname + '/upload-translation-job-processor.cjs';

export async function createUploadTranslationJobQueue() {
  const queue = createQueue('upload-translation-queue');
  if (process.env.NODE_ENV === 'test') {
    const module = await import(esmFile);
    queue.process(module.default);
  } else {
    queue.process(cjsFile);
  }
  return queue;
}

const uploadTranslationJobOptions = {
  attempts: config.scheduledJobs.attempts,
  backoff: { type: 'exponential', delay: 100 },
  removeOnComplete: true,
  removeOnFail: 1,
  delay: 1000,
};

export async function start() {
  const queue = new Queue('upload-translation-queue', config.scheduledJobs.redisUrl);
  await queue.add({}, uploadTranslationJobOptions);
  await queue.close();
}
