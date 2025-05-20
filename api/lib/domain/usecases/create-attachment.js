import { Attachment } from '../models/index.js';

export async function createAttachment({
  attachmentCreationCommand,
  attachmentRepository,
  challengeRepository,
  localizedChallengeRepository,
  createChallengeTransformer,
  updatedRecordNotifier,
  pixApiClient,
  logger,
  Sentry,
}) {
  if (attachmentCreationCommand.localizedChallengeId) {
    const localizedChallenge = await localizedChallengeRepository.get({ id: attachmentCreationCommand.localizedChallengeId });
    attachmentCreationCommand.challengeId = localizedChallenge.challengeId;
  } else {
    attachmentCreationCommand.localizedChallengeId = attachmentCreationCommand.challengeId;
  }
  const attachmentToCreate = Attachment.buildFromCreationCommand(attachmentCreationCommand);
  const createdAttachment = await attachmentRepository.create(attachmentToCreate);

  try {
    const primaryChallenge = await challengeRepository.get(createdAttachment.challengeId);
    const allChallenges = [
      primaryChallenge,
      ...primaryChallenge.alternativeLocales.map((locale) => primaryChallenge.translate(locale))
    ];
    const challengeForAttachment = allChallenges.find((challenge) => challenge.id === createdAttachment.localizedChallengeId);
    const attachments = await attachmentRepository.listByLocalizedChallengeIds([createdAttachment.localizedChallengeId]);
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
  return createdAttachment;
}
