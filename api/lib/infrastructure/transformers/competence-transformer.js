import { CompetenceForRelease } from '../../domain/models/release/index.js';

export function transformForRelease(competence) {
  return new CompetenceForRelease({
    id: competence.id,
    index: competence.index,
    name_i18n: competence.name_i18n,
    description_i18n: competence.description_i18n,
    areaId: competence.areaId,
    skillIds: competence.skillIds,
    thematicIds: competence.thematicIds,
    origin: competence.origin,
  });
}

export function transformForReplication(competence) {
  return {
    id: competence.id,
    index: competence.index,
    name_i18n: competence.name_i18n,
    description_i18n: competence.description_i18n,
    areaId: competence.areaId,
    skillIds: competence.skillIds,
    thematicIds: competence.thematicIds,
    origin: competence.origin,
  };
}
