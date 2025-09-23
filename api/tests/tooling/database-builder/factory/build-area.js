import { databaseBuffer } from '../database-buffer.js';

export function buildArea({ id, code, color, frameworkId, createdAt, updatedAt } = {}) {
  return databaseBuffer.pushInsertable({
    tableName: 'areas',
    autoId: false,
    values: { id, code, color, frameworkId, createdAt, updatedAt },
  });
}
