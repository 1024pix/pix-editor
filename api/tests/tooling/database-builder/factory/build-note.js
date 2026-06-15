import { databaseBuffer } from '../database-buffer.js';

/**
 * @param {{
 *   id: string
 *   status?: string
 *   text: string
 *   author: string
 *   challengeId: string
 *   createdAt?: string | number | Date
 *   updatedAt?: string | number | Date
 * }} noteToBuild
 */
export function buildNote({ id, status, text, author, challengeId, createdAt, updatedAt } = {}) {
  return databaseBuffer.pushInsertable({
    tableName: 'notes',
    autoId: false,
    values: { id, status, text, author, challengeId, createdAt, updatedAt },
  });
}
