import { databaseBuffer } from '../database-buffer.js';

export function buildWhitelistedUrl({
  id = databaseBuffer.nextId++,
  createdBy = null,
  latestUpdatedBy = null,
  deletedBy = null,
  createdAt = new Date(),
  updatedAt = new Date(),
  deletedAt = null,
  url = 'https://mon-petit-chien.com',
  relatedEntityIds = null,
  comment = null,
  checkType = 'exact_match',
} = {}) {
  if (createdBy && !latestUpdatedBy) {
    latestUpdatedBy = createdBy;
  }
  const values = { id, createdBy, latestUpdatedBy, deletedBy, createdAt, updatedAt, deletedAt, url, relatedEntityIds, comment, checkType };

  return databaseBuffer.pushInsertable({
    tableName: 'whitelisted_urls',
    values,
  });
}
