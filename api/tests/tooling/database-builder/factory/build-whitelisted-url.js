import { databaseBuffer } from '../database-buffer.js';

/**
 * @param {{
 *   id?: number
 *   url?: string
 *   relatedSkillNames?: string
 *   comment?: string
 *   checkType?: 'exact_match' | 'starts_with'
 *   createdBy?: number
 *   latestUpdatedBy?: number
 *   deletedBy?: number
 *   deletedAt?: string | number | Date
 *   createdAt?: string | number | Date
 *   updatedAt?: string | number | Date
 * }} whitelistedUrlToBuild
 */
export function buildWhitelistedUrl({
  id = databaseBuffer.nextId++,
  createdBy = null,
  latestUpdatedBy = null,
  deletedBy = null,
  createdAt = new Date(),
  updatedAt = new Date(),
  deletedAt = null,
  url = 'https://mon-petit-chien.com',
  relatedSkillNames = null,
  comment = null,
  checkType = 'exact_match',
} = {}) {
  if (createdBy && !latestUpdatedBy) {
    latestUpdatedBy = createdBy;
  }
  const values = {
    id,
    createdBy,
    latestUpdatedBy,
    deletedBy,
    createdAt,
    updatedAt,
    deletedAt,
    url,
    relatedSkillNames,
    comment,
    checkType,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'whitelisted_urls',
    values,
  });
}
