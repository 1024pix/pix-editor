export function buildThematic(
  {
    id,
    airtableId = id,
    name_i18n: {
      fr: name,
      en: nameEnUs,
    } = {},
    competenceId,
    tubeIds,
    index,
  } = {}) {
  return {
    id: airtableId,
    'fields': {
      'id persistant': id,
      'Nom': name,
      'Titre en-us': nameEnUs,
      'Competence (id persistant)': [competenceId],
      'Tubes (id persistant)': tubeIds,
      'Index': index
    },
  };
}
