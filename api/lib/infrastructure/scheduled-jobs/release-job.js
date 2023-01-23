const createQueue = require('./create-queue');
const config = require('../../config');
const logger = require('../logger');

const queue = createQueue('create-release-queue');
const processFile = __dirname + '/release-job-processor.js';
queue.process(process.env.NODE_ENV === 'test' ? require(processFile) : processFile);

const releaseJobOptions = {
  attempts: config.scheduledJobs.attempts,
  backoff: { type: 'exponential', delay: 100 },
  removeOnComplete: true,
  removeOnFail: 1,
  repeat: {
    cron: config.scheduledJobs.createReleaseTime,
    tz: 'Europe/Paris',
  },
};

function schedule() {
  if (!_isScheduledReleaseEnabled()) {
    logger.info('Scheduled release is not enabled - check `CREATE_RELEASE_TIME` and `REDIS_URL` variables');
    return;
  }
  queue.add({}, releaseJobOptions);
}

function _isScheduledReleaseEnabled() {
  return config.scheduledJobs.createReleaseTime && config.scheduledJobs.redisUrl;
}

module.exports = {
  schedule,
  queue,
};
