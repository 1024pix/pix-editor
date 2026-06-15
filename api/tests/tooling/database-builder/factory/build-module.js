import { databaseBuffer } from '../database-buffer.js';

/**
 * @param {{
 *   id: string
 *   moduleId?: string
 *   shortId: string
 *   slug: string
 *   title: string
 *   internalTitle: string
 *   isBeta?: boolean
 *   visibility: string
 *   details: {
 *     image: string
 *     duration: number
 *     description: string
 *     objectives: string[]
 *     tabletSupport: string
 *     level: string
 *   },
 *   sections: object
 *   glossary?: object
 *   createdAt?: string | number | Date
 *   updatedAt?: string | number | Date
 * }} moduleToBuild
 */
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
