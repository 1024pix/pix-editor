export function buildCompetence({
  id = 'competenceid1',
  airtableId,
  index,
  areaId,
  areaAirtableId,
  skillIds,
  thematicIds,
  thematicAirtableIds,
  origin,
  tubeAirtableIds,
  tubeIds,
} = {}) {
  return {
    id: airtableId ?? id,
    'fields': {
      'id persistant': id,
      'Sous-domaine': index,
      'Domaine (id persistant)': [areaId],
      'Domaine': [areaAirtableId],
      'Acquis (via Tubes) (id persistant)': skillIds,
      'Thematiques (id persistant)': thematicIds,
      'Thematiques': thematicAirtableIds,
      'Origine2': [origin],
      'Tubes': tubeAirtableIds,
      'Tubes (id persistant)': tubeIds,
    },
  };
}
