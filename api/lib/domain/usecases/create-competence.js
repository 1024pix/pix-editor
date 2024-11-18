import * as Sentry from '@sentry/node';
import { logger } from '../../infrastructure/logger.js';
import * as updatedRecordNotifier from '../../infrastructure/event-notifier/updated-record-notifier.js';
import * as pixApiClient from '../../infrastructure/pix-api-client.js';
import { areaRepository, competenceRepository } from '../../infrastructure/repositories/index.js';
import { competenceTransformer } from '../../infrastructure/transformers/index.js';
import { BadRequestError } from '../../infrastructure/errors.js';

export async function createCompetence(competence) {
  const [area, competences] = await Promise.all([
    areaRepository.getByAirtableId(competence.areaAirtableId),
    competenceRepository.listByAreaAirtableId(competence.areaAirtableId),
  ]);

  if (!area) {
    throw new BadRequestError('unknown area');
  }

  competence.index = `${area.code}.${(competences?.length ?? 0) + 1}`;

  const createdCompetence = await competenceRepository.create(competence);

  try {
    await updatedRecordNotifier.notify({
      pixApiClient,
      model: 'competences',
      updatedRecord: competenceTransformer.filterCompetenceFields(createdCompetence),
    });
  } catch (err) {
    logger.error(err);
    Sentry.captureException(err);
  }

  return createdCompetence;
}
