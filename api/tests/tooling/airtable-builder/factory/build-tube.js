export function buildTube({
  id,
  airtableId = id,
  name,
  index,
  competenceId,
} = {}) {

  return {
    id: airtableId,
    'fields': {
      'id persistant': id,
      'Nom': name,
      'Index': index,
      'Competences (id persistant)': [competenceId],
    },
  };
}
