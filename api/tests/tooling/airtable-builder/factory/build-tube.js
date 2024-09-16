export function buildTube({
  id,
  name,
  competenceId,
  index,
} = {}) {

  return {
    id,
    'fields': {
      'id persistant': id,
      'Nom': name,
      'Competences (id persistant)': [competenceId],
      'Index': index,
    },
  };
}
