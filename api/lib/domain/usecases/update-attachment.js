export async function updateAttachment({ attachmentUpdateCommand, attachmentRepository }) {
  const attachment = await attachmentRepository.get(attachmentUpdateCommand.id);
  if (!attachment) return null;
  attachment.update(attachmentUpdateCommand);
  return attachmentRepository.update(attachment);
}
