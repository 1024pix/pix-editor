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
 * }} draftModuleToBuild
 */
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
