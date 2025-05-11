import { Attachment } from '../models/index.js';

export async function createAttachment({ attachmentCreationCommand, attachmentRepository, localizedChallengeRepository }) {
  if (attachmentCreationCommand.localizedChallengeId) {
    const localizedChallenge = await localizedChallengeRepository.get({ id: attachmentCreationCommand.localizedChallengeId });
    attachmentCreationCommand.challengeId = localizedChallenge.challengeId;
  } else {
    attachmentCreationCommand.localizedChallengeId = attachmentCreationCommand.challengeId;
  }
  const attachmentToCreate = Attachment.buildFromCreationCommand(attachmentCreationCommand);
  return attachmentRepository.create(attachmentToCreate);
}
