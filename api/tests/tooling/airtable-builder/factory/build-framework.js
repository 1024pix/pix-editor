export function buildFramework({
  id,
  name,
  areaIds,
} = {}) {
  return {
    id,
    'fields': {
      'Nom': name,
      'Domaines (identifiants)': areaIds,
    },
  };
}
