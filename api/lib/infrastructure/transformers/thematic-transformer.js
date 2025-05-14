export function filterThematicsFields(thematics) {
  return thematics.map(filterThematicFields);
}

export function filterThematicFields({ id, name_i18n, index, competenceId, tubeIds }) {
  return { id,name_i18n,index, competenceId,tubeIds };
}
