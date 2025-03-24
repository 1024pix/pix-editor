import { NotFoundError } from '../errors.js';
import * as updatedRecordNotifier from '../../infrastructure/event-notifier/updated-record-notifier.js';
import * as pixApiClient from '../../infrastructure/pix-api-client.js';
import { logger } from '../../infrastructure/logger.js';
import * as Sentry from '@sentry/node';

export async function createSkill(skill, dependencies = {
  skillRepository,
  tubeRepository,
  skillTransformer,
  updatedRecordNotifier,
  pixApiClient,
  generateNewIdFnc
}) {
  const tube = await dependencies.tubeRepository.getByAirtableId(skill.tubeAirtableId);
  if (tube == null) throw new NotFoundError('Tube introuvable');

  const tubeSkills = await dependencies.skillRepository.listByTubeId(tube.id);
  skill.prepareForCreation(tube, tubeSkills, dependencies.generateNewIdFnc);

  const createdSkill = await dependencies.skillRepository.create(skill);
  try {
    const [skillForRelease] = dependencies.skillTransformer.filterSkillsFields([createdSkill]);
    await dependencies.updatedRecordNotifier.notify({ updatedRecord: skillForRelease , model: 'skills', pixApiClient: dependencies.pixApiClient });
  } catch (err) {
    logger.error(err);
    Sentry.captureException(err);
  }
  return createdSkill;
}
