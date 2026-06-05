import { databaseBuffer } from '../database-buffer.js';

export function buildModule({
  id,
  shortId,
  internalTitle,
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
    shortId,
    internalTitle,
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

  databaseBuffer.pushInsertable({
    tableName: 'modules',
    values: valuesForDb,
  });

  return values;
}
