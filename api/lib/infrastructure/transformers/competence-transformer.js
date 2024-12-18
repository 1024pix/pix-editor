export function filterCompetencesFields(competences) {
  return competences.map(filterCompetenceFields);
}

export function filterCompetenceFields({
  id,
  index,
  name_i18n,
  description_i18n,
  areaId,
  skillIds,
  thematicIds,
  origin,
}) {
  return {
    id,
    index,
    name_i18n,
    description_i18n,
    areaId,
    skillIds,
    thematicIds,
    origin,
  };
}
