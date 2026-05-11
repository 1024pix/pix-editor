import './job-process.js';
import { SlackNotifier } from '../notifications/SlackNotifier.js';
import * as checkUrlsJob from './check-urls-job.js';
import * as uploadTranslationJob from './upload-translation-job.js';
import * as config from '../../config.js';
import { downloadTranslationFromPhrase } from '../../domain/usecases/index.js';
import * as learningContentNotification from '../../domain/services/learning-content-notification.js';
import { child } from '../logger.js';
import { releaseRepository } from '../repositories/index.js';

const logger = child('job:create-release-queue', { event: 'create-release-queue' });

export default async function releaseJobProcessor(job) {
  try {
    await downloadTranslationFromPhrase();
    const releaseId = await releaseRepository.create();
    if (config.notifications.slack.enable && job.data.slackNotification) {
      await learningContentNotification.notifyReleaseCreationSuccess(
        new SlackNotifier(config.notifications.slack.webhookUrl),
      );
    }
    logger.info(`Periodic release created with id ${releaseId}`);
    if (config.scheduledJobs.startCheckUrlJob) {
      await checkUrlsJob.start();
    }
    await uploadTranslationJob.start();
    return releaseId;
  } catch (error) {
    logger.error(error);
    if (config.notifications.slack.enable) {
      await learningContentNotification.notifyReleaseCreationFailure(
        error.message,
        new SlackNotifier(config.notifications.slack.webhookUrl),
      );
    }
  }
}
