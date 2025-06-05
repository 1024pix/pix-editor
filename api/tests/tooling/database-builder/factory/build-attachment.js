import { databaseBuffer } from '../database-buffer.js';

export function buildAttachment({
  id,
  airtableId,
  filename,
  url,
  type,
  size,
  mimeType,
  airtableChallengeId,
  localizedChallengeId,
  createdAt,
  updatedAt,
}) {
  return databaseBuffer.pushInsertable({
    autoId: false,
    tableName: 'attachments',
    values: {
      id,
      airtableId,
      filename,
      url,
      type,
      size,
      mimeType,
      airtableChallengeId,
      localizedChallengeId,
      createdAt,
      updatedAt,
    },
  });
}
