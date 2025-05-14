import * as Sentry from '@sentry/node';
import { logger } from '../../infrastructure/logger.js';
import * as updatedRecordNotifier from '../../infrastructure/event-notifier/updated-record-notifier.js';
import * as pixApiClient from '../../infrastructure/pix-api-client.js';
import { areaRepository, competenceRepository, thematicRepository, tubeRepository } from '../../infrastructure/repositories/index.js';
import { competenceTransformer, thematicTransformer, tubeTransformer } from '../../infrastructure/transformers/index.js';
import { BadRequestError } from '../../infrastructure/errors.js';
import { Thematic, Tube } from '../models/index.js';

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

  const workbenchTube = new Tube({
    competenceAirtableId: createdCompetence.airtableId,
    name: Tube.WORKBENCH_NAME,
    thematicAirtableId: createdWorkbenchThematic.airtableId,
    practicalTitle_i18n: {
      fr: `Tube pour l'atelier de la compétence ${createdCompetence.index} ${createdCompetence.origin}`,
    },
    practicalDescription_i18n: {},
  });

  const createdWorkbenchTube = await tubeRepository.create(workbenchTube);

  createdCompetence.thematicIds = [createdWorkbenchThematic.id];
  createdCompetence.thematicAirtableIds = [createdWorkbenchThematic.airtableId];
  createdCompetence.tubeAirtableIds = [createdWorkbenchTube.airtableId];

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
      updatedRecordNotifier.notify({
        pixApiClient,
        model: 'tubes',
        updatedRecord: tubeTransformer.filterTubeFields(createdWorkbenchTube),
      }),
    ]);
  } catch (err) {
    logger.error(err);
    Sentry.captureException(err);
  }

  return createdCompetence;
}
