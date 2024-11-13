export function filterAreaFields({
  id,
  code,
  title_i18n,
  name,
  competenceIds,
  color,
  frameworkId,
}) {
  return {
    id,
    code,
    title_i18n,
    name,
    competenceIds,
    color,
    frameworkId,
  };
}

export function filterAreasFields(frameworks) {
  return frameworks.map(filterAreaFields);
}
