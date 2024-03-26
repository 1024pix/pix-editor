export function buildThematic(
  {
    id,
    airtableId = id,
    competenceId,
    tubeIds,
    index,
  } = {}) {
  return {
    id: airtableId,
    'fields': {
      'id persistant': id,
      'Competence (id persistant)': [competenceId],
      'Tubes (id persistant)': tubeIds,
      'Index': index
    },
  };
}
