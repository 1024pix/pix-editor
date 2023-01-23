const createQueue = require('./create-queue');
const config = require('../../config');

const queue = createQueue('check-urls-queue');
const processFile = __dirname + '/check-urls-job-processor.js';
queue.process(process.env.NODE_ENV === 'test' ? require(processFile) : processFile);

const checkUrlsJobOptions = {
  attempts: config.scheduledJobs.attempts,
  backoff: { type: 'exponential', delay: 100 },
  removeOnComplete: true,
  removeOnFail: 1,
};

function start() {
  queue.add({}, checkUrlsJobOptions);
}

module.exports = {
  queue,
  start,
};
