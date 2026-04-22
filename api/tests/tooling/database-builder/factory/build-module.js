import { databaseBuffer } from '../database-buffer.js';

export function buildModule({
  id,
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
    tableName: 'modules',
    values: {
      id,
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
