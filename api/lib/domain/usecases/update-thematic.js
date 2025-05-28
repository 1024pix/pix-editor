import { thematicRepository } from '../../infrastructure/repositories/index.js';
import { thematicTransformer } from '../../infrastructure/transformers/index.js';
import * as updatedRecordNotifier from '../../infrastructure/event-notifier/updated-record-notifier.js';
import * as pixApiClient from '../../infrastructure/pix-api-client.js';
import { logger } from '../../infrastructure/logger.js';
import * as Sentry from '@sentry/node';
import { NotFoundError } from '../errors.js';

export async function updateThematic(thematicAirtableId, thematicUpdates, dependencies = { thematicRepository, thematicTransformer, updatedRecordNotifier, pixApiClient }) {
  const thematic = await dependencies.thematicRepository.getByAirtableId(thematicAirtableId);

  if (!thematic) {
    throw new NotFoundError('unknown thematic id');
  }

  thematic.update(thematicUpdates);

  const updatedThematic = await dependencies.thematicRepository.update(thematic);

  try {
    await dependencies.updatedRecordNotifier.notify({
      model: 'thematics',
      updatedRecord: dependencies.thematicTransformer.filterThematicFields(updatedThematic),
      pixApiClient: dependencies.pixApiClient,
    });
  } catch (err) {
    logger.error(err);
    Sentry.captureException(err);
  }

  return updatedThematic;
}
