import { Attachment } from '../models/index.js';

export async function createAttachment({
  attachmentCreationCommand,
  attachmentRepository,
  updatePixApiReleaseCache,
}) {
  const attachmentToCreate = new Attachment({
    filename: attachmentCreationCommand.filename,
    size: attachmentCreationCommand.size,
    url: attachmentCreationCommand.url,
    mimeType: attachmentCreationCommand.mimeType,
    type: attachmentCreationCommand.type,
    challengeId: attachmentCreationCommand.challengeId,
    localizedChallengeId: attachmentCreationCommand.localizedChallengeId ?? attachmentCreationCommand.challengeId,
  });
  const createdAttachment = await attachmentRepository.create(attachmentToCreate);
  await updatePixApiReleaseCache.onAttachmentCreated(createdAttachment);
  return createdAttachment;
}
