export function buildTag(
  {
    id,
    airtableId = id,
    title,
    skillAirtableIds = [],
    tutorialAirtableIds = [],
  } = {}) {
  return {
    id: airtableId,
    'fields': {
      'id persistant': id,
      'Nom': title,
      'Acquis': skillAirtableIds,
      'Tutoriels': tutorialAirtableIds,
    },
  };
}
