export function buildThematic(
  {
    id,
    competenceId,
    tubeIds,
    index,
  } = {}) {
  return {
    id,
    'fields': {
      'id persistant': id,
      'Competence (id persistant)': [competenceId],
      'Tubes (id persistant)': tubeIds,
      'Index': index
    },
  };
}
