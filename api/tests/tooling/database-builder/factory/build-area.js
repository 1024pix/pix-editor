import { databaseBuffer } from '../database-buffer.js';

/**
 * @param {{
 *   id: string
 *   code: `${number}`
 *   color?: string
 *   frameworkId: string
 *   createdAt?: string | number | Date
 *   updatedAt?: string | number | Date
 * }} areaToBuild
 */
export function buildArea({ id, code, color, frameworkId, createdAt, updatedAt } = {}) {
  return databaseBuffer.pushInsertable({
    tableName: 'areas',
    autoId: false,
    values: { id, code, color, frameworkId, createdAt, updatedAt },
  });
}
