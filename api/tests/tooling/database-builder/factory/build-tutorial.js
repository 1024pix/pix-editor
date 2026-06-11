import { databaseBuffer } from '../database-buffer.js';

/**
 * @param {{
 *   id: string
 *   title: string
 *   duration: string
 *   source: string
 *   format: string
 *   link: string
 *   license?: string
 *   level?: string
 *   crush?: boolean
 *   locale: string
 *   tagIds: string[]
 *   createdAt?: string | number | Date
 *   updatedAt?: string | number | Date
 * }} staticCourseTagToBuild
 */
export function buildTutorial({
  id,
  title,
  duration,
  source,
  format,
  link,
  license,
  level,
  crush,
  locale,
  tagIds,
  createdAt,
  updatedAt,
} = {}) {
  const tutorial = databaseBuffer.pushInsertable({
    tableName: 'tutorials',
    autoId: false,
    values: { id, title, duration, source, format, link, license, level, crush, locale, createdAt, updatedAt },
  });
  tagIds?.forEach((tutorialTagId) =>
    databaseBuffer.pushInsertable({
      tableName: 'tutorials-tutorial_tags',
      autoId: false,
      values: { tutorialId: id, tutorialTagId, createdAt, updatedAt },
    }),
  );
  return { ...tutorial, tagIds };
}
