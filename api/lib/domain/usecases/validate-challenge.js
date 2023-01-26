module.exports = async function validateChallenge({
  validateChallengeCommand,
  tubeForEditorRepository,
}) {
  const { challengeId, alternativeIdsToValidate, author, changelog } = validateChallengeCommand;
  const tube = await tubeForEditorRepository.getByChallengeId(challengeId);
  if (!tube) throw new Error(`Cannot validate challenge "${challengeId}": corresponding tube not found.`);
  tube.validateChallenge(challengeId, alternativeIdsToValidate);
  await tubeForEditorRepository.save(tube);
};
