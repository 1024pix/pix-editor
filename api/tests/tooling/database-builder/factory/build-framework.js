import { databaseBuffer } from '../database-buffer.js';

/**
 * @param {{
 *   id: string
 *   name: string
 *   createdAt?: string | number | Date
 *   updatedAt?: string | number | Date
 * }} frameworkToBuild
 */
export function buildFramework({ id, name, createdAt, updatedAt } = {}) {
  return databaseBuffer.pushInsertable({
    tableName: 'frameworks',
    autoId: false,
    values: { id, name, createdAt, updatedAt },
  });
}
