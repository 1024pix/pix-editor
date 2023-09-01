import { databaseBuffer } from '../database-buffer.js';

export function buildTranslation({ key, locale, value } = {}) {
  return databaseBuffer.pushInsertable({
    tableName: 'translations',
    autoId: false,
    values: { key, locale, value },
  });
}
