import { createQueue } from './create-queue.js';
import * as config from '../../config.js';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export const queue = createQueue('compare-content-pg-airtable-queue');

const esmFile = __dirname + '/compare-content-pg-airtable-job-processor.js';
const cjsFile = __dirname + '/compare-content-pg-airtable-job-processor.cjs';
if (process.env.NODE_ENV === 'test') {
  const module = await import(esmFile);
  queue.process(module.default);
} else {
  queue.process(cjsFile);
}

const comparePgAirtableOptions = {
  attempts: config.scheduledJobs.attempts,
  backoff: { type: 'exponential', delay: 100 },
  removeOnComplete: true,
  removeOnFail: 1,
  repeat: {
    cron: config.scheduledJobs.comparePgAirtable,
    tz: 'Europe/Paris',
  },
};

export function start() {
  return queue.add({}, comparePgAirtableOptions);
}
