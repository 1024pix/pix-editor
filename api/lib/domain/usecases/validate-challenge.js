const ChangelogEntryFactory = require('../models/ChangelogEntryFactory');

module.exports = async function validateChallenge({
  validateChallengeCommand,
  changelogRepository,
  tubeForEditorRepository,
}) {
  const { challengeId, alternativeIdsToValidate, author, changelog } = validateChallengeCommand;
  const tube = await tubeForEditorRepository.getByChallengeId(challengeId);
  if (!tube) throw new Error(`Cannot validate challenge "${challengeId}": corresponding tube not found.`);
  tube.validateChallenge(challengeId, alternativeIdsToValidate);
  await tubeForEditorRepository.save(tube);
  const changelogEntry = ChangelogEntryFactory.forChallengeValidation({ challengeId, author, changelog });
  await changelogRepository.save(changelogEntry);
};
