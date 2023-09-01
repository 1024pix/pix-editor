export function buildFramework({
  id,
  name,
} = {}) {
  return {
    id,
    'fields': {
      'Nom': name,
    },
  };
}
