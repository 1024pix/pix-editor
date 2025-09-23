import { databaseBuffer } from '../database-buffer.js';

export function buildCompetence({ id, index, areaId, createdAt, updatedAt } = {}) {
  return databaseBuffer.pushInsertable({
    tableName: 'competences',
    autoId: false,
    values: { id, index, areaId, createdAt, updatedAt },
  });
}
