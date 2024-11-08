import * as Sentry from '@sentry/node';
import { logger } from '../../infrastructure/logger.js';
import * as updatedRecordNotifier from '../../infrastructure/event-notifier/updated-record-notifier.js';
import * as pixApiClient from '../../infrastructure/pix-api-client.js';
import { frameworkTransformer } from '../../infrastructure/transformers/index.js';
import { frameworkRepository } from '../../infrastructure/repositories/index.js';

export async function createFramework(framework) {
  const createdFramework = await frameworkRepository.create(framework);

  try {
    await updatedRecordNotifier.notify({
      pixApiClient,
      model: 'frameworks',
      updatedRecord: frameworkTransformer.filterFrameworkFields(createdFramework),
    });
  } catch (err) {
    logger.error(err);
    Sentry.captureException(err);
  }

  return createdFramework;
}
