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
