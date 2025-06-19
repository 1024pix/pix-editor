import { databaseBuffer } from '../database-buffer.js';

export function buildSkill({
  id = 'skill123',
  airtableId = 'recSkill123',
  activatedAt = null,
  archivedAt = null,
  obsoletedAt = null,
} = {}) {
  return databaseBuffer.pushInsertable({
    tableName: 'skills',
    values: {
      id,
      airtableId,
      activatedAt,
      archivedAt,
      obsoletedAt,
    },
  });
}
