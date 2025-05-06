export function buildThematic(
  {
    id,
    airtableId = id,
    competenceId,
    competenceAirtableId,
    tubeIds,
    index,
  } = {}) {
  return {
    id: airtableId,
    'fields': {
      'id persistant': id,
      'Competence (id persistant)': [competenceId],
      'Competence': [competenceAirtableId],
      'Tubes (id persistant)': tubeIds,
      'Index': index
    },
  };
}
