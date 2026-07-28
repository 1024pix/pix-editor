import { databaseBuffer } from '../database-buffer.js';

/**
 * @param {{
 *   id?: number
 *   phraseProjectId: string
 *   frameworkId: string
 *   areaId?: string
 *   weblateComponent?: string
 *   uploadedLocales: string[]
 * }} translationsConfigToBuild
 */
export function buildTranslationsConfig({
  id = databaseBuffer.getNextId(),
  phraseProjectId,
  frameworkId,
  areaId,
  weblateComponent,
  uploadedLocales,
} = {}) {
  return databaseBuffer.pushInsertable({
    tableName: 'translations_config',
    values: {
      id,
      phraseProjectId,
      frameworkId,
      areaId,
      weblateComponent,
      uploadedLocales: JSON.stringify(uploadedLocales),
    },
  });
}
