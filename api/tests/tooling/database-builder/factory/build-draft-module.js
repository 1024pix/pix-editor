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
  const values = {
    id,
    moduleId,
    internalTitle,
    shortId,
    slug,
    title,
    isBeta,
    visibility,
    ...details,
    sections,
    glossary,
    createdAt,
    updatedAt,
  };

  const valuesForDb = {
    ...values,
    sections: JSON.stringify(values.sections),
    glossary: JSON.stringify(values.glossary),
  };

  return databaseBuffer.pushInsertable({
    tableName: 'draft-modules',
    values: valuesForDb,
  });
}
