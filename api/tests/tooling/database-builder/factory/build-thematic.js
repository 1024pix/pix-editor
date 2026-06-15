import { databaseBuffer } from '../database-buffer.js';

/**
 * @param {{
 *   id: string
 *   index?: number
 *   competenceId: string
 *   createdAt?: string | number | Date
 *   updatedAt?: string | number | Date
 * }} thematicToBuild
 */
export function buildThematic({ id, index, competenceId, createdAt, updatedAt } = {}) {
  return databaseBuffer.pushInsertable({
    tableName: 'thematics',
    autoId: false,
    values: { id, index, competenceId, createdAt, updatedAt },
  });
}
