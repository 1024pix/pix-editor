const createQueue = require('./create-queue');
const config = require('../../config');
const logger = require('../logger');

const queue = createQueue('compare-databases-queue');
const processFile = __dirname + '/compare-databases-job-processor.js';
queue.process(process.env.NODE_ENV === 'test' ? require(processFile) : processFile);

const compareDatabasesJobOptions = {
  attempts: config.scheduledJobs.attempts,
  backoff: { type: 'exponential', delay: 100 },
  removeOnComplete: true,
  removeOnFail: 1,
  repeat: {
    cron: config.scheduledJobs.compareDatabasesTime,
    tz: 'Europe/Paris',
  },
};

function schedule() {
  if (!_isScheduledCompareDatabasesEnabled()) {
    logger.info('Scheduled databases comparison is not enabled - check `COMPARE_DATABASES_TIME` variable');
    return;
  }
  queue.add({}, compareDatabasesJobOptions);
}

function _isScheduledCompareDatabasesEnabled() {
  return config.scheduledJobs.compareDatabasesTime;
}

module.exports = {
  schedule,
  queue,
};
