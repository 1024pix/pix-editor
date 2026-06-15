import { databaseBuffer } from '../database-buffer.js';

/**
 * @param {{
 *   key: string
 *   locale: string
 *   value: string
 * }} translationToBuild
 */
export function buildTranslation({ key, locale, value } = {}) {
  const translation = databaseBuffer.pushInsertable({
    tableName: 'translations',
    autoId: false,
    values: { key, locale, value },
  });

  return {
    ...translation,
    model: key.split('.')[0],
    entityId: key.split('.')[1],
  };
}
