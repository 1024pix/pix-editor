export function buildTag(
  {
    id,
    airtableId = id,
    title,
    notes,
    description,
    skillAirtableIds = [],
    tutorialAirtableIds = [],
  } = {}) {
  return {
    id: airtableId,
    'fields': {
      'id persistant': id,
      'Nom': title,
      'Notes': notes,
      'Description': description,
      'Acquis': skillAirtableIds,
      'Tutoriels': tutorialAirtableIds,
    },
  };
}
