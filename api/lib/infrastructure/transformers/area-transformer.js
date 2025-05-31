import { AreaForRelease } from '../../domain/models/release/index.js';

export function transformForRelease(area) {
  return new AreaForRelease({
    id: area.id,
    code: area.code,
    title_i18n: area.title_i18n,
    name: area.name,
    competenceIds: area.competenceIds,
    color: area.color,
    frameworkId: area.frameworkId,
  });
}

export function transformForReplication(area) {
  return {
    id: area.id,
    code: area.code,
    title_i18n: area.title_i18n,
    name: area.name,
    competenceIds: area.competenceIds,
    color: area.color,
    frameworkId: area.frameworkId,
  };
}
