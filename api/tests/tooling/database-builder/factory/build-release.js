import { databaseBuffer } from '../database-buffer.js';

/**
 * @param {{
 *   id: number
 *   content: string
 *   createdAt?: string | number | Date
 * }} releaseToBuild
 */
export function buildRelease({ id = databaseBuffer.nextId++, content, createdAt = new Date() } = {}) {
  const values = { id, content, createdAt };

  return databaseBuffer.pushInsertable({
    tableName: 'releases',
    values,
  });
}
