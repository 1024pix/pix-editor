import { databaseBuffer } from '../database-buffer.js';

export function buildTube({ id, name, index, thematicId, createdAt, updatedAt } = {}) {
  return databaseBuffer.pushInsertable({
    tableName: 'tubes',
    autoId: false,
    values: { id, name, index, thematicId, createdAt, updatedAt },
  });
}
