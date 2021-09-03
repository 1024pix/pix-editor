const Queue = require('bull');
const Sentry = require('@sentry/node');
const config = require('../../config');
const logger = require('../logger');
const releaseRepository = require('../repositories/release-repository.js');
const SlackNotifier = require('../notifications/SlackNotifier');
const learningContentNotification = require('../../domain/services/learning-content-notification');

const queueError = (err, ...messages) => {
  logger.error(err, ...messages);
  Sentry.captureException(err);
};
const queueMessage = (message) => {
  logger.info(message);
};

const queue = new Queue('create-release-queue', config.scheduledJobs.redisUrl);
queue.on('error', (err, additionalError) => queueError(err, 'Queue error for creating release', additionalError));
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

  createRelease,
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
  try {
    const release = await releaseRepository.create();
    if (config.notifications.slack.enable) {
      await learningContentNotification.notifyReleaseCreationSuccess(new SlackNotifier());
    }
    logger.info(`Periodic release created with id ${release.id}`);
    return release.id;
  } catch (error) {
    if (config.notifications.slack.enable) {
      await learningContentNotification.notifyReleaseCreationFailure(error.message, new SlackNotifier());
    }
    logger.error(error);
  }
}

function _isScheduledReleaseEnabled() {
  return config.scheduledJobs.createReleaseTime && config.scheduledJobs.redisUrl;
}

