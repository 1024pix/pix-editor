const Queue = require('bull');
const Sentry = require('@sentry/node');
const config = require('../../config');
const logger = require('../logger');
const releaseRepository = require('../repositories/release-repository.js');

const queueError = (err, message) => {
  logger.error(err, message);
  Sentry.captureException(err);
};
const queue = new Queue('create-release-queue', config.scheduledJobs.redisUrl);
queue.on('error', (err) => queueError(err, 'Queue error for creating release'));
queue.on('failed', (job, err) => queueError(err, `Release job ${job.id} failed`));
queue.process(createRelease);

module.exports = {
  schedule() {
    if (!_isScheduledReleaseEnabled()) {
      logger.info('Scheduled release is not enabled - check `CREATE_RELEASE_TIME` and `REDIS_URL` variables');
      return;
    }
    queue.add({}, releaseJobOptions);
  },

  queue,

};

const releaseJobOptions = {
  attempts: 1,
  removeOnComplete: true,
  removeOnFail: 1,
  repeat: {
    cron: config.scheduledJobs.createReleaseTime,
    tz: 'Europe/Paris',
  },
};

async function createRelease() {
  const release = await releaseRepository.create();
  logger.debug(`Periodic release created with id ${release.id}`);
  return release;
}

function _isScheduledReleaseEnabled() {
  return config.scheduledJobs.createReleaseTime && config.scheduledJobs.redisUrl;
}

