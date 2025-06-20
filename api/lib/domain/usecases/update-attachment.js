import { NotFoundError } from '../errors.js';

export async function updateAttachment({
  attachmentUpdateCommand,
  attachmentRepository,
  updatePixApiReleaseCache,
}) {
  const attachment = await attachmentRepository.get(attachmentUpdateCommand.id);
  if (!attachment)
    throw new NotFoundError(`Attachment d'id ${attachmentUpdateCommand.id} n'existe pas`);
  attachment.update(attachmentUpdateCommand);
  const updatedAttachment = await attachmentRepository.update(attachment);
  await updatePixApiReleaseCache.onAttachmentUpdated(updatedAttachment);
  return updatedAttachment;
}
