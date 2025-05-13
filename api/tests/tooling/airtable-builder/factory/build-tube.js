export function buildTube({
  id,
  airtableId = id,
  name,
  index,
  thematicAirtableId,
  competenceAirtableId,
  competenceId,
} = {}) {

  return {
    id: airtableId,
    'fields': {
      'id persistant': id,
      'Nom': name,
      'Index': index,
      'Thematique': [thematicAirtableId],
      'Competences': [competenceAirtableId],
      'Competences (id persistant)': [competenceId],
    },
  };
}
