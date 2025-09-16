import { databaseBuffer } from '../database-buffer.js';

export function buildFramework({ id, name, createdAt, updatedAt } = {}) {
  return databaseBuffer.pushInsertable({
    tableName: 'frameworks',
    autoId: false,
    values: { id, name, createdAt, updatedAt },
  });
}
