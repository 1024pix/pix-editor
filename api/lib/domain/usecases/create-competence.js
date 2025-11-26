import { logger } from '../../infrastructure/logger.js';
import * as updatedRecordNotifier from '../../infrastructure/event-notifier/updated-record-notifier.js';
import * as pixApiClient from '../../infrastructure/pix-api-client.js';
import {
  areaRepository,
  competenceRepository,
  skillRepository,
  thematicRepository,
  tubeRepository,
} from '../../infrastructure/repositories/index.js';
import { skillTransformer, tubeTransformer } from '../../infrastructure/transformers/index.js';
import { BadRequestError } from '../../infrastructure/errors.js';
import { Skill, Thematic, Tube } from '../models/index.js';
import * as idGenerator from '../../infrastructure/utils/id-generator.js';
import * as updatePixApiReleaseCache from '../services/update-pix-api-release-cache.js';

export async function createCompetence(competence) {
  const area = await areaRepository.get(competence.areaAirtableId);

  if (!area) {
    throw new BadRequestError('unknown area');
  }

  const indexInArea = (area.competenceIds?.length ?? 0) + 1;
  competence.index = `${area.code}.${indexInArea}`;

  const createdCompetence = await competenceRepository.create(competence);

  const workbenchThematic = new Thematic({
    name_i18n: { fr: `workbench_${area.code}_${indexInArea}` },
    competenceAirtableId: createdCompetence.airtableId,
    index: 0,
  });

  const createdWorkbenchThematic = await thematicRepository.create(workbenchThematic);

  const workbenchTube = new Tube({
    competenceAirtableId: createdCompetence.airtableId,
    name: Tube.WORKBENCH_NAME,
    thematicAirtableId: createdWorkbenchThematic.airtableId,
    practicalTitle_i18n: { fr: `Tube pour l'atelier de la compétence ${createdCompetence.index} ${createdCompetence.origin}` },
    practicalDescription_i18n: {},
  });

  const createdWorkbenchTube = await tubeRepository.create(workbenchTube);

  const workbenchSkill = new Skill({
    id: idGenerator.generateNewId('skill'),
    name: '@workbench',
    tubeAirtableId: createdWorkbenchTube.airtableId,
    description: `Acquis pour l'atelier de la compétence ${createdCompetence.index} ${createdCompetence.origin}`,
    hint_i18n: {},
  });

  const createdWorkbenchSkill = await skillRepository.create(workbenchSkill);

  createdCompetence.thematicIds = [createdWorkbenchThematic.id];
  createdCompetence.thematicAirtableIds = [createdWorkbenchThematic.airtableId];
  createdCompetence.tubeAirtableIds = [createdWorkbenchTube.airtableId];

  createdWorkbenchThematic.tubeIds = [createdWorkbenchTube.id];
  createdWorkbenchThematic.tubeAirtableIds = [createdWorkbenchTube.airtableId];

  createdWorkbenchTube.skillIds = [createdWorkbenchSkill.id];
  createdWorkbenchTube.skillAirtableIds = [createdWorkbenchSkill.airtableId];

  try {
    await Promise.all([
      updatePixApiReleaseCache.onCompetenceCreated(createdCompetence),
      updatePixApiReleaseCache.onThematicCreated(createdWorkbenchThematic),
      updatedRecordNotifier.notify({
        pixApiClient,
        model: 'tubes',
        updatedRecord: tubeTransformer.transformTube(createdWorkbenchTube),
      }),
      updatedRecordNotifier.notify({
        pixApiClient,
        model: 'skills',
        updatedRecord: skillTransformer.forRelease(createdWorkbenchSkill),
      }),
    ]);
  } catch (err) {
    logger.error(err);
  }

  return createdCompetence;
}
