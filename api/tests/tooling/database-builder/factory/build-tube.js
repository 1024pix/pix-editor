import { databaseBuffer } from '../database-buffer.js';

/**
 * @param {{
 *   id: string
 *   name: string
 *   index?: string
 *   thematicId: string
 *   createdAt?: string | number | Date
 *   updatedAt?: string | number | Date
 * }} tubeToBuild
 */
export function buildTube({ id, name, index, thematicId, createdAt, updatedAt } = {}) {
  return databaseBuffer.pushInsertable({
    tableName: 'tubes',
    autoId: false,
    values: { id, name, index, thematicId, createdAt, updatedAt },
  });
}
