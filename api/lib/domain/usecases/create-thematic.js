import { thematicRepository } from '../../infrastructure/repositories/index.js';
import { thematicTransformer } from '../../infrastructure/transformers/index.js';
import * as updatedRecordNotifier from '../../infrastructure/event-notifier/updated-record-notifier.js';
import * as pixApiClient from '../../infrastructure/pix-api-client.js';
import { logger } from '../../infrastructure/logger.js';
import * as Sentry from '@sentry/node';

export async function createThematic(thematic, dependencies = { thematicRepository, thematicTransformer, updatedRecordNotifier, pixApiClient }) {
  const competenceThematics = await dependencies.thematicRepository.listByCompetenceAirtableId(thematic.competenceAirtableId);

  thematic.prepareForCreation(competenceThematics);

  const createdThematic = await dependencies.thematicRepository.create(thematic);

  try {
    await dependencies.updatedRecordNotifier.notify({
      model: 'thematics',
      updatedRecord: dependencies.thematicTransformer.filterThematicFields(createdThematic),
      pixApiClient: dependencies.pixApiClient,
    });
  } catch (err) {
    logger.error(err);
    Sentry.captureException(err);
  }

  return createdThematic;
}
