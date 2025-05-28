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
  const localizedChallengeId = attachmentCreationCommand.localizedChallengeId ?? attachmentCreationCommand.challengeId;
  const localizedChallenge = await localizedChallengeRepository.get({ id: localizedChallengeId });
  const attachmentToCreate = new Attachment({
    filename: attachmentCreationCommand.filename,
    size: attachmentCreationCommand.size,
    url: attachmentCreationCommand.url,
    mimeType: attachmentCreationCommand.mimeType,
    type: attachmentCreationCommand.type,
    localizedChallengeId: localizedChallenge.id,
    challengeId: localizedChallenge.challengeId,
  });
  const createdAttachment = await attachmentRepository.create(attachmentToCreate);

  try {
    const primaryChallenge = await challengeRepository.get(createdAttachment.challengeId);
    const attachments = await attachmentRepository.listByLocalizedChallengeIds([createdAttachment.localizedChallengeId]);
    const challengeToTransform = localizedChallenge.isPrimary ? primaryChallenge : primaryChallenge.translate(localizedChallenge.locale);
    const transformChallenge = createChallengeTransformer({ attachments });
    const challenge = transformChallenge(challengeToTransform);
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
