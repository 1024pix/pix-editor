export function buildTube({
  id,
  name,
  competenceId,
} = {}) {

  return {
    id,
    'fields': {
      'id persistant': id,
      'Nom': name,
      'Competences (id persistant)': [competenceId],
    },
  };
}
