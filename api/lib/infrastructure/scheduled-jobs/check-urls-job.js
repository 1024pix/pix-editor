const createQueue = require('./create-queue');
const config = require('../../config');
const queue = createQueue('check-urls-queue');

const checkUrlsJobOptions = {
  attempts: config.scheduledJobs.attempts,
  backoff: { type: 'exponential', delay: 100 },
  removeOnComplete: true,
  removeOnFail: 1,
};

queue.process(__dirname + '/check-urls-job-processor.js');

function start() {
  queue.add({}, checkUrlsJobOptions);
}

module.exports = {
  queue,
  start,
};
