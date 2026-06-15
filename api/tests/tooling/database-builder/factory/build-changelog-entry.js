import { databaseBuffer } from '../database-buffer.js';

/**
 * @param {{
 *   id: string
 *   text: string
 *   author: string
 *   elementId: string
 *   elementType?: string
 *   createdAt?: string | number | Date
 * }} changelogEntryToBuild
 */
export function buildChangelogEntry({ id, text, author, elementId, elementType, createdAt } = {}) {
  return databaseBuffer.pushInsertable({
    tableName: 'changelog_entries',
    autoId: false,
    values: { id, text, author, elementId, elementType, createdAt },
  });
}
