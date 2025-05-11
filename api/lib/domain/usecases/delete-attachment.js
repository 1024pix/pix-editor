export function deleteAttachment({ attachmentId, attachmentRepository }) {
  return attachmentRepository.destroy(attachmentId);
}
