import { NotFoundError } from '../errors.js';

export async function updateAttachment({
  attachmentUpdateCommand,
  attachmentRepository,
  challengeRepository,
  localizedChallengeRepository,
  createChallengeTransformer,
  updatedRecordNotifier,
  pixApiClient,
  logger,
  Sentry,
}) {
  const attachment = await attachmentRepository.get(attachmentUpdateCommand.id);
  if (!attachment)
    throw new NotFoundError(`Attachment d'id ${attachmentUpdateCommand.id} n'existe pas`);
  attachment.update(attachmentUpdateCommand);
  const updatedAttachment = await attachmentRepository.update(attachment);

  try {
    const localizedChallenge = await localizedChallengeRepository.get({ id: updatedAttachment.localizedChallengeId });
    const primaryChallenge = await challengeRepository.get(updatedAttachment.challengeId);
    const attachments = await attachmentRepository.listByLocalizedChallengeIds([updatedAttachment.localizedChallengeId]);
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
  return updatedAttachment;
}
