export function findAttachment({ id, attachmentRepository }) {
  return attachmentRepository.get(id);
}
