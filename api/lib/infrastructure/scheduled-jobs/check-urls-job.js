import { createQueue } from './create-queue.js';
import * as config from '../../config.js';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export const queue = createQueue('check-urls-queue');
const cjsFile = __dirname + '/check-urls-job-processor.cjs';
const esmFile = __dirname + '/check-urls-job-processor.js';
if (process.env.NODE_ENV === 'test') {
  import(esmFile).then((module) => {
    queue.process(module.default);
  });
} else {
  queue.process(cjsFile);
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
