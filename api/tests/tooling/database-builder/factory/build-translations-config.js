import { databaseBuffer } from '../database-buffer.js';

/**
 * @param {{
 *   id?: number
 *   phraseProjectId: string
 *   frameworkId: string
 *   areaId?: string
 *   uploadedLocales: string[]
 * }} translationsConfigToBuild
 */
export function buildTranslationsConfig({
  id = databaseBuffer.getNextId(),
  phraseProjectId,
  frameworkId,
  areaId,
  uploadedLocales,
} = {}) {
  return databaseBuffer.pushInsertable({
    tableName: 'translations_config',
    values: {
      id,
      phraseProjectId,
      frameworkId,
      areaId,
      uploadedLocales: JSON.stringify(uploadedLocales),
    },
  });
}
