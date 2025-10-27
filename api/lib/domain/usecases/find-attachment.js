import { NotFoundError } from '../errors.js';

export async function findAttachment({ id, attachmentRepository }) {
  const attachment = await attachmentRepository.get(id);
  if (!attachment) throw new NotFoundError(`Attachment d'id ${id} n'existe pas`);
  return attachment;
}
