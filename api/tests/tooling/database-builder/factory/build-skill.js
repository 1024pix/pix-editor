import { databaseBuffer } from '../database-buffer.js';

export function buildSkill({
  id,
  status,
  hintStatus,
  descriptionStatus,
  description,
  level,
  internationalisation,
  version,
  tubeId,
  activatedAt,
  archivedAt,
  obsoletedAt,
  createdAt,
  updatedAt,
} = {}) {
  return databaseBuffer.pushInsertable({
    tableName: 'skills',
    values: {
      id,
      status,
      hintStatus,
      descriptionStatus,
      description,
      level,
      internationalisation,
      version,
      tubeId,
      activatedAt,
      archivedAt,
      obsoletedAt,
      createdAt,
      updatedAt,
    },
  });
}
