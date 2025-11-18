import { databaseBuffer } from '../database-buffer.js';

export function buildNote({ id, status, text, author, challengeId, createdAt, updatedAt } = {}) {
  return databaseBuffer.pushInsertable({
    tableName: 'notes',
    autoId: false,
    values: { id, status, text, author, challengeId, createdAt, updatedAt },
  });
}
