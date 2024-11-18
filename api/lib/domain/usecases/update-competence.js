import * as Sentry from '@sentry/node';
import { logger } from '../../infrastructure/logger.js';
import * as updatedRecordNotifier from '../../infrastructure/event-notifier/updated-record-notifier.js';
import * as pixApiClient from '../../infrastructure/pix-api-client.js';
import { competenceRepository } from '../../infrastructure/repositories/index.js';
import { competenceTransformer } from '../../infrastructure/transformers/index.js';
import { NotFoundError } from '../../infrastructure/errors.js';

export async function updateCompetence(competenceAirtableId, competenceUpdates) {
  const competence = await competenceRepository.getByAirtableId(competenceAirtableId);

  if (!competence) throw new NotFoundError('unknown competence');

  competence.update(competenceUpdates);

  const updatedCompetence = await competenceRepository.update(competence);

  try {
    await updatedRecordNotifier.notify({
      pixApiClient,
      model: 'competences',
      updatedRecord: competenceTransformer.filterCompetenceFields(updatedCompetence),
    });
  } catch (err) {
    logger.error(err);
    Sentry.captureException(err);
  }

  return updatedCompetence;
}
