export function buildTag(
  {
    id,
    airtableId = id,
    name,
    skillAirtableIds = [],
    tutorialAirtableIds = [],
  } = {}) {
  return {
    id: airtableId,
    'fields': {
      'id persistant': id,
      'Nom': name,
      'Acquis': skillAirtableIds,
      'Tutoriels': tutorialAirtableIds,
    },
  };
}
