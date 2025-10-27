import { NotFoundError } from '../errors.js';

export async function deleteAttachment({ attachmentId, attachmentRepository, updatePixApiReleaseCache }) {
  const attachmentToDelete = await attachmentRepository.get(attachmentId);
  if (!attachmentToDelete) throw new NotFoundError(`Attachment d'id ${attachmentId} n'existe pas`);
  await attachmentRepository.remove(attachmentId);
  await updatePixApiReleaseCache.onAttachmentDeleted(attachmentToDelete);
}
