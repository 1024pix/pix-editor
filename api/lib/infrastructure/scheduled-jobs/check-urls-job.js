import { createQueue } from './create-queue.js';
import * as config from '../../config.js';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export const queue = createQueue('check-urls-queue');
const processFile = __dirname + '/check-urls-job-processor.cjs';
if (process.env.NODE_ENV === 'test') {
  import(processFile).then((module) => {
    queue.process(module.default);
  });
} else {
  queue.process(processFile);
}

const checkUrlsJobOptions = {
  attempts: config.scheduledJobs.attempts,
  backoff: { type: 'exponential', delay: 100 },
  removeOnComplete: true,
  removeOnFail: 1,
};

export function start() {
  queue.add({}, checkUrlsJobOptions);
}
