import { databaseBuffer } from '../database-buffer.js';

export function buildLocalizedChallengeAttachment({
  localizedChallengeId = 'challenge123',
  attachmentId = 'attachment123'
} = {}) {
  return databaseBuffer.pushInsertable({
    autoId: false,
    tableName: 'localized_challenges-attachments',
    values: { localizedChallengeId, attachmentId },
  });
}
