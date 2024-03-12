import { createQueue } from './create-queue.js';
import * as config from '../../config.js';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export const queue = createQueue('upload-translation-queue');

const esmFile = __dirname + '/upload-translation-job-processor.js';
const cjsFile = __dirname + '/upload-translation-job-processor.cjs';
if (process.env.NODE_ENV === 'test') {
  const module = await import(esmFile);
  queue.process(module.default);
} else {
  queue.process(cjsFile);
}

const uploadTranslationJobOptions = {
  attempts: config.scheduledJobs.attempts,
  backoff: { type: 'exponential', delay: 100 },
  removeOnComplete: true,
  removeOnFail: 1,
  delay: 1000
};

export function start() {
  return queue.add({}, uploadTranslationJobOptions);
}
