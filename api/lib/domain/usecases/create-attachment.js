import { Attachment } from '../models/index.js';

export async function createAttachment({
  attachmentCreationCommand,
  attachmentRepository,
  localizedChallengeRepository,
  updatePixApiReleaseCache,
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
  await updatePixApiReleaseCache.onAttachmentCreated({ attachment: createdAttachment });
  return createdAttachment;
}
