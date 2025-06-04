export function buildTag(
  {
    id,
    airtableId = id,
    name,
  } = {}) {
  return {
    id: airtableId,
    'fields': {
      'id persistant': id,
      'Nom': name,
    },
  };
}
