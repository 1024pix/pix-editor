export function buildTag(
  {
    id,
    airtableId = id,
    title,
    notes,
  } = {}) {
  return {
    id: airtableId,
    'fields': {
      'id persistant': id,
      'Nom': title,
      'Notes': notes,
    },
  };
}
