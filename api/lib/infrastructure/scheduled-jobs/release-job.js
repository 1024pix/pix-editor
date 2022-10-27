const createQueue = require('./create-queue');
const config = require('../../config');
const logger = require('../logger');
const releaseRepository = require('../repositories/release-repository.js');
const SlackNotifier = require('../notifications/SlackNotifier');
const learningContentNotification = require('../../domain/services/learning-content-notification');
const checkUrlsJob = require('./check-urls-job');

const queue = createQueue('create-release-queue');
queue.process(createRelease);

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

async function createRelease(job) {
  try {
    const releaseId = await releaseRepository.create();
    if (_isSlackNotificationGloballyEnabled() && job.data.slackNotification === true) {
      await learningContentNotification.notifyReleaseCreationSuccess(new SlackNotifier(config.notifications.slack.webhookUrl));
    }
    logger.info(`Periodic release created with id ${releaseId}`);
    checkUrlsJob.start();
    return releaseId;
  } catch (error) {
    if (_isSlackNotificationGloballyEnabled()) {
      await learningContentNotification.notifyReleaseCreationFailure(error.message, new SlackNotifier(config.notifications.slack.webhookUrl));
    }
    logger.error(error);
  }
}

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

function _isSlackNotificationGloballyEnabled() {
  return config.notifications.slack.enable;
}

module.exports = {
  schedule,
  queue,
  createRelease,
};
