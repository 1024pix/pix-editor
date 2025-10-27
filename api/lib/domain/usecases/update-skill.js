export async function updateSkill(updateCommand, dependencies) {
  const skill = await dependencies.skillRepository.getByAirtableId(updateCommand.airtableId);
  if (!skill) return null;

  skill.update(updateCommand, dependencies.normalizeNonBreakingSpaceFnc);
  const updatedSkill = await dependencies.skillRepository.update(skill);

  try {
    const skillForRelease = dependencies.skillTransformer.forRelease(updatedSkill);
    await dependencies.updatedRecordNotifier.notify({
      updatedRecord: skillForRelease,
      model: 'skills',
      pixApiClient: dependencies.pixApiClient,
    });
  } catch (err) {
    dependencies.logger.error(err);
  }

  return updatedSkill;
}
