import { databaseBuffer } from '../database-buffer.js';

/**
 * @param {{
 *   id: string
 *   title: string
 *   notes?: string
 *   createdAt?: string | number | Date
 *   updatedAt?: string | number | Date
 * }} tagToBuild
 */
export function buildTag({ id, title, createdAt, updatedAt } = {}) {
  return databaseBuffer.pushInsertable({
    tableName: 'tutorial_tags',
    autoId: false,
    values: { id, title, createdAt, updatedAt },
  });
}
