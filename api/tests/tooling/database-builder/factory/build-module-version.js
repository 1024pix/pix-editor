import { databaseBuffer } from '../database-buffer.js';

/**
 * @param {{
 *   id?: number
 *   moduleId: string
 *   publishedBy?: number
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
 *   version: string
 *   createdAt?: string | number | Date
 * }} moduleVersionToBuild
 */
export function buildModuleVersion({
  id,
  moduleId,
  publishedBy,
  shortId,
  internalTitle,
  slug,
  title,
  isBeta,
  visibility,
  details,
  sections,
  glossary,
  version,
  createdAt,
} = {}) {
  const values = {
    id,
    moduleId,
    publishedBy,
    shortId,
    internalTitle,
    slug,
    title,
    isBeta,
    visibility,
    ...details,
    sections,
    glossary,
    version,
    createdAt,
  };

  const valuesForDb = {
    ...values,
    sections: JSON.stringify(values.sections),
    glossary: JSON.stringify(values.glossary),
  };

  return databaseBuffer.pushInsertable({
    tableName: 'module-versions',
    values: valuesForDb,
  });
}
