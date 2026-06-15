import { databaseBuffer } from '../database-buffer.js';

/**
 * @param {{
 *   id: string
 *   status?: string
 *   hintStatus?: string
 *   description?: string
 *   descriptionStatus?: string
 *   level?: number
 *   internationalisation?: string
 *   version?: number
 *   tubeId?: string
 *   tutorialIds?: string[]
 *   learningMoreTutorialIds?: string[]
 *   activatedAt?: string | number | Date
 *   archivedAt?: string | number | Date
 *   obsoletedAt?: string | number | Date
 *   createdAt?: string | number | Date
 *   updatedAt?: string | number | Date
 * }} skillToBuild
 */
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
  tutorialIds,
  learningMoreTutorialIds,
  activatedAt,
  archivedAt,
  obsoletedAt,
  createdAt,
  updatedAt,
} = {}) {
  const skill = databaseBuffer.pushInsertable({
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
  tutorialIds?.forEach((tutorialId) =>
    databaseBuffer.pushInsertable({
      tableName: 'skills-tutorials',
      autoId: false,
      values: { skillId: id, tutorialId, type: 'understanding', createdAt, updatedAt },
    }),
  );
  learningMoreTutorialIds?.forEach((tutorialId) =>
    databaseBuffer.pushInsertable({
      tableName: 'skills-tutorials',
      autoId: false,
      values: { skillId: id, tutorialId, type: 'learningMore', createdAt, updatedAt },
    }),
  );
  return { ...skill, tutorialIds, learningMoreTutorialIds };
}
