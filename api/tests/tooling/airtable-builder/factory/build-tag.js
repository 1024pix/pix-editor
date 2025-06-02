export function buildTag(
  {
    id,
    airtableId = id,
    skillAirtableId,
    tutorialAirtableIds = [],
    title,
    description,
    notes,
  } = {}) {
  return {
    id: airtableId,
    'fields': {
      'id persistant': id,
      'Acquis': skillAirtableId ? [skillAirtableId] : null,
      'Tutoriels': tutorialAirtableIds,
      'Nom': title,
      'Description': description,
      'Notes': notes,
    },
  };
}
