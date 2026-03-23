import { databaseBuffer } from '../database-buffer.js';

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
