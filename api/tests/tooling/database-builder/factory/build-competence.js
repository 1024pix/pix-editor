import { databaseBuffer } from '../database-buffer.js';

/**
 * @param {{
 *   id: string
 *   index: `${number}.${number}`
 *   areaId: string
 *   createdAt?: string | number | Date
 *   updatedAt?: string | number | Date
 * }} competenceToBuild
 */
export function buildCompetence({ id, index, areaId, createdAt, updatedAt } = {}) {
  return databaseBuffer.pushInsertable({
    tableName: 'competences',
    autoId: false,
    values: { id, index, areaId, createdAt, updatedAt },
  });
}
