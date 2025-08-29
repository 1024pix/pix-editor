import { NotFoundError } from '../errors.js';
import * as updatedRecordNotifier from '../../infrastructure/event-notifier/updated-record-notifier.js';
import * as pixApiClient from '../../infrastructure/pix-api-client.js';
import { logger } from '../../infrastructure/logger.js';

export async function createSkill(skill, dependencies = {
  skillRepository,
  tubeRepository,
  skillTransformer,
  updatedRecordNotifier,
  pixApiClient,
  generateNewIdFnc,
  normalizeNonBreakingSpaceFnc,
}) {
  const tube = await dependencies.tubeRepository.getByAirtableId(skill.tubeAirtableId);
  if (tube == null) throw new NotFoundError('Tube introuvable');

  const tubeSkills = await dependencies.skillRepository.listByTubeId(tube.id);
  skill.prepareForCreation(tube, tubeSkills, dependencies.generateNewIdFnc, dependencies.normalizeNonBreakingSpaceFnc);

  const createdSkill = await dependencies.skillRepository.create(skill);
  try {
    const skillForRelease = dependencies.skillTransformer.forRelease(createdSkill);
    await dependencies.updatedRecordNotifier.notify({ updatedRecord: skillForRelease , model: 'skills', pixApiClient: dependencies.pixApiClient });
  } catch (err) {
    logger.error(err);
  }
  return createdSkill;
}
