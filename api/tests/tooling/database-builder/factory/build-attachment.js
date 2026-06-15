import { databaseBuffer } from '../database-buffer.js';

/**
 * @param {{
 *   id: string
 *   text: string
 *   size: number
 *   type: string
 *   mimeType?: string
 *   filename: string
 *   challengeId?: string
 *   localizedChallengeId: string
 *   createdAt?: string | number | Date
 *   updatedAt?: string | number | Date
 * }} attachmentToBuild
 */
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
