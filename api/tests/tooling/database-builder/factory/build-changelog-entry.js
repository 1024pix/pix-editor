import { databaseBuffer } from '../database-buffer.js';

export function buildChangelogEntry({ id, text, author, elementId, elementType, createdAt } = {}) {
  return databaseBuffer.pushInsertable({
    tableName: 'changelog_entries',
    autoId: false,
    values: { id, text, author, elementId, elementType, createdAt },
  });
}
