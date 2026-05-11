import { createQueue } from './create-queue.js';
import * as config from '../../config.js';
import { fileURLToPath } from 'node:url';
import Queue from 'bull';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const esmFile = __dirname + '/delete-unmentioned-keys-after-upload-job-processor.js';
const cjsFile = __dirname + '/delete-unmentioned-keys-after-upload-job-processor.cjs';

export async function createDeleteUnmentionedKeysAfterUploadJobQueue() {
  const queue = createQueue('delete-unmentioned-keys-after-upload-queue');
  if (process.env.NODE_ENV === 'test') {
    const module = await import(esmFile);
    queue.process(module.default);
  } else {
    queue.process(cjsFile);
  }
  return queue;
}

const deleteUnmentionedKeysAfterUploadJobOptions = {
  attempts: config.scheduledJobs.attempts,
  backoff: { type: 'exponential', delay: 100 },
  removeOnComplete: true,
  removeOnFail: true,
  delay: 3 * 60 * 1000,
};

export async function schedule({ uploadId, projectId }) {
  const queue = new Queue('delete-unmentioned-keys-after-upload-queue', config.scheduledJobs.redisUrl);
  await queue.add({ uploadId, projectId }, deleteUnmentionedKeysAfterUploadJobOptions);
  await queue.close();
}
