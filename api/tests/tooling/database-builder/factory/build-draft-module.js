import { databaseBuffer } from '../database-buffer.js';

export function buildDraftModule({
  id,
  moduleId,
  internalTitle,
  shortId,
  slug,
  title,
  isBeta,
  visibility,
  details,
  sections,
  glossary,
  createdAt,
  updatedAt,
} = {}) {
  return databaseBuffer.pushInsertable({
    tableName: 'draft-modules',
    values: {
      id,
      moduleId,
      internalTitle,
      shortId,
      slug,
      title,
      isBeta,
      visibility,
      ...details,
      sections: JSON.stringify(sections),
      glossary: JSON.stringify(glossary),
      createdAt,
      updatedAt,
    },
  });
}
