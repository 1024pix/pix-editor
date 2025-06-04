export function buildTube({
  id,
  airtableId = id,
  name,
  index,
  thematicAirtableId,
  competenceAirtableId,
  competenceId,
  skillAirtableIds,
  skillIds,
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
      'Acquis': skillAirtableIds,
      'Acquis (id persistant)': skillIds,
    },
  };
}
