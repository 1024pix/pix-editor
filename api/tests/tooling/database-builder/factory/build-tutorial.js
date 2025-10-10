import { databaseBuffer } from '../database-buffer.js';

export function buildTutorial({ id, title, duration, source, format, link, license, level, crush, locale, tagIds, createdAt, updatedAt } = {}) {
  const tutorial = databaseBuffer.pushInsertable({
    tableName: 'tutorials',
    autoId: false,
    values: { id, title, duration, source, format, link, license, level, crush, locale, createdAt, updatedAt },
  });
  tagIds?.forEach((tutorialTagId) => databaseBuffer.pushInsertable({
    tableName: 'tutorials-tutorial_tags',
    autoId: false,
    values: { tutorialId: id, tutorialTagId, createdAt, updatedAt },
  }));
  return { ...tutorial, tagIds };
}
