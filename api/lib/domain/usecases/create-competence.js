import * as Sentry from '@sentry/node';
import { logger } from '../../infrastructure/logger.js';
import * as updatedRecordNotifier from '../../infrastructure/event-notifier/updated-record-notifier.js';
import * as pixApiClient from '../../infrastructure/pix-api-client.js';
import { areaRepository, competenceRepository, thematicRepository } from '../../infrastructure/repositories/index.js';
import { competenceTransformer, thematicTransformer } from '../../infrastructure/transformers/index.js';
import { BadRequestError } from '../../infrastructure/errors.js';
import { Thematic } from '../models/Thematic.js';

export async function createCompetence(competence) {
  const [area, competences] = await Promise.all([
    areaRepository.getByAirtableId(competence.areaAirtableId),
    competenceRepository.listByAreaAirtableId(competence.areaAirtableId),
  ]);

  if (!area) {
    throw new BadRequestError('unknown area');
  }

  const indexInArea = (competences?.length ?? 0) + 1;
  competence.index = `${area.code}.${indexInArea}`;

  const createdCompetence = await competenceRepository.create(competence);

  const workbenchThematic = new Thematic({
    name_i18n: { fr:`workbench_${area.code}_${indexInArea}` },
    competenceAirtableId: createdCompetence.airtableId,
    index: 0,
  });

  const createdWorkbenchThematic = await thematicRepository.create(workbenchThematic);

  createdCompetence.thematicIds = [createdWorkbenchThematic.id];
  createdCompetence.thematicAirtableIds = [createdWorkbenchThematic.airtableId];

  try {
    await Promise.all([
      updatedRecordNotifier.notify({
        pixApiClient,
        model: 'competences',
        updatedRecord: competenceTransformer.filterCompetenceFields(createdCompetence),
      }),
      updatedRecordNotifier.notify({
        pixApiClient,
        model: 'thematics',
        updatedRecord: thematicTransformer.filterThematicFields(createdWorkbenchThematic),
      }),
    ]);
  } catch (err) {
    logger.error(err);
    Sentry.captureException(err);
  }

  return createdCompetence;
}
