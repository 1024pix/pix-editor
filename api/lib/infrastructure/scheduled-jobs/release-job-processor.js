import './job-process.js';
import { SlackNotifier } from '../notifications/SlackNotifier.js';
import * as checkUrlsJob from './check-urls-job.js';
import * as uploadTranslationJob from './upload-translation-job.js';
import * as config from '../../config.js';
import { downloadTranslationFromPhrase } from '../../domain/usecases/index.js';
import * as learningContentNotification from '../../domain/services/learning-content-notification.js';
import { logger } from '../logger.js';
import { releaseRepository } from '../repositories/index.js';

export default async function releaseJobProcessor(job) {
  try {
    await downloadTranslationFromPhrase();
    const releaseId = await releaseRepository.create();
    if (_isSlackNotificationGloballyEnabled() && job.data.slackNotification === true) {
      await learningContentNotification.notifyReleaseCreationSuccess(new SlackNotifier(config.notifications.slack.webhookUrl));
    }
    logger.info(`Periodic release created with id ${releaseId}`);
    if (config.scheduledJobs.startCheckUrlJob) {
      checkUrlsJob.start();
    }
    await uploadTranslationJob.start();
    return releaseId;
  } catch (error) {
    if (_isSlackNotificationGloballyEnabled()) {
      await learningContentNotification.notifyReleaseCreationFailure(error.message, new SlackNotifier(config.notifications.slack.webhookUrl));
    }
    logger.error(error);
  }
}

function _isSlackNotificationGloballyEnabled() {
  return config.notifications.slack.enable;
}
