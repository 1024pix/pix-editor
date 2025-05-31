import { ThematicForRelease } from '../../domain/models/release/index.js';

export function filterThematicsFields(thematics) {
  return thematics.map(filterThematicFields);
}

export function filterThematicFields({ id, name_i18n, index, competenceId, tubeIds }) {
  return { id,name_i18n,index, competenceId,tubeIds };
}

export function transformForRelease(thematic) {
  return new ThematicForRelease({
    id: thematic.id,
    name_i18n: thematic.name_i18n,
    index: thematic.index,
    competenceId: thematic.competenceId,
    tubeIds: thematic.tubeIds,
  });
}

export function transformForReplication(thematic) {
  return {
    id: thematic.id,
    name_i18n: thematic.name_i18n,
    index: thematic.index,
    competenceId: thematic.competenceId,
    tubeIds: thematic.tubeIds,
  };
}
