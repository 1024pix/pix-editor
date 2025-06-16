import * as updatePixApiReleaseCache from '../services/update-pix-api-release-cache.js';

export async function updateSkill(updateCommand, dependencies) {
  const skill = await dependencies.skillRepository.getByAirtableId(updateCommand.airtableId);
  if (!skill) return null;

  skill.update(updateCommand, dependencies.normalizeNonBreakingSpaceFnc);
  const updatedSkill = await dependencies.skillRepository.update(skill);
  await updatePixApiReleaseCache.onSkillUpdated(updatedSkill);

  return updatedSkill;
}
