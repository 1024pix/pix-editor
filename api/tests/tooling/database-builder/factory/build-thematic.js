import { databaseBuffer } from '../database-buffer.js';

export function buildThematic({ id, index, competenceId, createdAt, updatedAt } = {}) {
  return databaseBuffer.pushInsertable({
    tableName: 'thematics',
    autoId: false,
    values: { id, index, competenceId, createdAt, updatedAt },
  });
}
