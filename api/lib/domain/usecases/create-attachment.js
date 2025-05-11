import { Attachment } from '../models/index.js';

export function createAttachment({ attachmentCreationCommand, attachmentRepository }) {
  const attachmentToCreate = Attachment.buildFromCreationCommand(attachmentCreationCommand);
  return attachmentRepository.create(attachmentToCreate);
}
