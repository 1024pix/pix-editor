export function buildTag(
  {
    id,
    airtableId = id,
    title,
  } = {}) {
  return {
    id: airtableId,
    'fields': {
      'id persistant': id,
      'Nom': title,
    },
  };
}
