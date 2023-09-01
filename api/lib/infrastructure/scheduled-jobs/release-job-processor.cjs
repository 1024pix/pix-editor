const { SlackNotifier } = await import('../notifications/SlackNotifier.js');
const checkUrlsJob = await import('./check-urls-job.js');
const config = await import('../../config.js');
const learningContentNotification = await import('../../domain/services/learning-content-notification.js');
const { logger } = await import('../logger.js');
const { releaseRepository } = await import('../repositories/index.js');
const { disconnect } = await import('../../../db/knex-database-connection.js');

module.exports = async function releaseJobProcessor(job) {
  try {
    const releaseId = await releaseRepository.create();
    if (_isSlackNotificationGloballyEnabled() && job.data.slackNotification === true) {
      await learningContentNotification.notifyReleaseCreationSuccess(new SlackNotifier(config.notifications.slack.webhookUrl));
    }
    logger.info(`Periodic release created with id ${releaseId}`);
    if (config.scheduledJobs.startCheckUrlJob) {
      checkUrlsJob.start();
    }
    return releaseId;
  } catch (error) {
    if (_isSlackNotificationGloballyEnabled()) {
      await learningContentNotification.notifyReleaseCreationFailure(error.message, new SlackNotifier(config.notifications.slack.webhookUrl));
    }
    logger.error(error);
  }
};

function _isSlackNotificationGloballyEnabled() {
  return config.notifications.slack.enable;
}

async function exitOnSignal(signal) {
  logger.info(`Processor received signal ${signal}. Closing DB connections before exiting.`);
  try {
    await disconnect();
    process.exit(0);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
}

process.on('SIGTERM', () => { exitOnSignal('SIGTERM'); });
process.on('SIGINT', () => { exitOnSignal('SIGINT'); });
