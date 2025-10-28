import { databaseBuffer } from '../database-buffer.js';

export function buildAttachment({
  id,
  url,
  size,
  type,
  mimeType,
  filename,
  challengeId,
  localizedChallengeId,
  createdAt,
  updatedAt,
} = {}) {
  return databaseBuffer.pushInsertable({
    tableName: 'attachments',
    autoId: false,
    values: { id, url, size, type, mimeType, filename, challengeId, localizedChallengeId, createdAt, updatedAt },
  });
}
