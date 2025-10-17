import { databaseBuffer } from '../database-buffer.js';

export function buildTag({ id, title, createdAt, updatedAt } = {}) {
  return databaseBuffer.pushInsertable({
    tableName: 'tutorial_tags',
    autoId: false,
    values: { id, title, createdAt, updatedAt },
  });
}
