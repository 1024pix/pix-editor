import { NotFoundError } from '../errors.js';
import * as updatePixApiReleaseCache from '../services/update-pix-api-release-cache.js';

export async function createSkill(skill, dependencies = {
  skillRepository,
  tubeRepository,
  generateNewIdFnc,
  normalizeNonBreakingSpaceFnc,
}) {
  const tube = await dependencies.tubeRepository.getByAirtableId(skill.tubeAirtableId);
  if (tube == null) throw new NotFoundError('Tube introuvable');

  const tubeSkills = await dependencies.skillRepository.listByTubeId(tube.id);
  skill.prepareForCreation(tube, tubeSkills, dependencies.generateNewIdFnc, dependencies.normalizeNonBreakingSpaceFnc);

  const createdSkill = await dependencies.skillRepository.create(skill);
  await updatePixApiReleaseCache.onSkillCreated(createdSkill);
  return createdSkill;
}
