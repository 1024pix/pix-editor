export function buildCompetence({
  id = 'competenceid1',
  airtableId,
  index,
  areaId,
  skillIds,
  thematicIds,
  origin,
} = {}) {
  return {
    id: airtableId ?? id,
    'fields': {
      'id persistant': id,
      'Sous-domaine': index,
      'Domaine (id persistant)': [areaId],
      'Acquis (via Tubes) (id persistant)': skillIds,
      'Thematiques (id persistant)': thematicIds,
      'Origine2': [origin],
    },
  };
}
