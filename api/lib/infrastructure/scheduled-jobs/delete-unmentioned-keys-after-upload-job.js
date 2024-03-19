import { createQueue } from './create-queue.js';
import * as config from '../../config.js';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export const queue = createQueue('delete-unmentioned-keys-after-upload-queue');

const esmFile = __dirname + '/delete-unmentioned-keys-after-upload-job-processor.js';
const cjsFile = __dirname + '/delete-unmentioned-keys-after-upload-job-processor.cjs';
if (process.env.NODE_ENV === 'test') {
  const module = await import(esmFile);
  queue.process(module.default);
} else {
  queue.process(cjsFile);
}

const deleteUnmentionedKeysAfterUploadJobOptions = {
  attempts: config.scheduledJobs.attempts,
  backoff: { type: 'exponential', delay: 100 },
  removeOnComplete: true,
  removeOnFail: true,
  delay: 3 * 60 * 1000
};

export function schedule({ uploadId }) {
  queue.add({ uploadId }, deleteUnmentionedKeysAfterUploadJobOptions);
}
