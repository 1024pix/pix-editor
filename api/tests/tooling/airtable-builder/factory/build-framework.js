export function buildFramework({
  id,
  name,
  areaAirtableIds,
  areaIds,
} = {}) {
  return {
    id,
    'fields': {
      'Nom': name,
      'Domaines (identifiants)': areaAirtableIds,
      'Domaines (identifiants) (id persistant)': areaIds,
    },
  };
}
