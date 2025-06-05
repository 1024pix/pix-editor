import { thematicRepository, tubeRepository } from '../../infrastructure/repositories/index.js';
import { tubeTransformer } from '../../infrastructure/transformers/index.js';
import * as updatedRecordNotifier from '../../infrastructure/event-notifier/updated-record-notifier.js';
import * as pixApiClient from '../../infrastructure/pix-api-client.js';
import { logger } from '../../infrastructure/logger.js';
import * as Sentry from '@sentry/node';
import { NotFoundError } from '../errors.js';

export async function createTube(tube, dependencies = { tubeRepository, thematicRepository, tubeTransformer, updatedRecordNotifier, pixApiClient }) {
  const thematic = await dependencies.thematicRepository.getByAirtableId(tube.thematicAirtableId);
  if (!thematic) throw new NotFoundError('unknown thematic id');

  tube.prepareForCreation(thematic);

  const createdTube = await dependencies.tubeRepository.create(tube);

  try {
    await dependencies.updatedRecordNotifier.notify({
      model: 'tubes',
      updatedRecord: dependencies.tubeTransformer.transformTube(createdTube, thematic.id),
      pixApiClient: dependencies.pixApiClient,
    });
  } catch (err) {
    logger.error(err);
    Sentry.captureException(err);
  }

  return createdTube;
}
