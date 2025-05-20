export async function deleteAttachment({
  attachmentId,
  attachmentRepository,
  challengeRepository,
  createChallengeTransformer,
  updatedRecordNotifier,
  pixApiClient,
  logger,
  Sentry,
}) {
  const attachmentToDelete = await attachmentRepository.get(attachmentId);
  await attachmentRepository.destroy(attachmentId);
  try {
    const primaryChallenge = await challengeRepository.get(attachmentToDelete.challengeId);
    const allChallenges = [
      primaryChallenge,
      ...primaryChallenge.alternativeLocales.map((locale) => primaryChallenge.translate(locale))
    ];
    const challengeForAttachment = allChallenges.find((challenge) => challenge.id === attachmentToDelete.localizedChallengeId);
    const attachments = await attachmentRepository.listByLocalizedChallengeIds([attachmentToDelete.localizedChallengeId]);
    const transformChallenge = createChallengeTransformer({ attachments });
    const challenge = transformChallenge(challengeForAttachment);
    await updatedRecordNotifier.notify({
      pixApiClient,
      model: 'challenges',
      updatedRecord: challenge,
    });
  } catch (err) {
    logger.error(err);
    Sentry.captureException(err);
  }
}
