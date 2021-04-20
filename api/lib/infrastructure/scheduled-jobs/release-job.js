const Queue = require('bull');
const Sentry = require('@sentry/node');
const config = require('../../config');
const logger = require('../logger');
const releaseRepository = require('../repositories/release-repository.js');

const queueError = (err, message) => {
  logger.error(err, message);
  Sentry.captureException(err);
};
const queueMessage = (message) => {
  logger.info(message);
};

const queue = new Queue('create-release-queue', config.scheduledJobs.redisUrl);
queue.on('error', (err) => queueError(err, 'Queue error for creating release'));
queue.on('failed', (job, err) => queueError(err, `Release job ${job.id} failed`));
queue.on('waiting', (jobId) => queueMessage(`A job ${jobId} has been scheduled`));
queue.on('active', () => queueMessage('A job has started'));
queue.on('stalled', () => queueMessage('A job has stalled'));
queue.on('completed', () => queueMessage('A job has finished'));
queue.on('paused', () => queueMessage('The queue has been paused'));
queue.on('resumed', () => queueMessage('The queue has been resumed'));
queue.on('cleaned', () => queueMessage('The queue has been cleaned'));
queue.on('drained', () => queueMessage('The queue has been drained'));
queue.on('removed', () => queueMessage('A job has been removed'));

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

