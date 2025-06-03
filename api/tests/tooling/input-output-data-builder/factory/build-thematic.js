export function buildThematic(
  {
    id,
    name_i18n: {
      fr: name,
      en: nameEnUs,
    } = {},
    competenceId,
    competenceAirtableId,
    tubeIds,
    tubeAirtableIds,
    index,
  } = {}) {
  return {
    id,
    'fields': {
      'id persistant': id,
      'Nom': name,
      'Titre en-us': nameEnUs,
      'Competence (id persistant)': [competenceId],
      'Competence': [competenceAirtableId],
      'Tubes (id persistant)': tubeIds,
      'Tubes': tubeAirtableIds,
      'Index': index
    },
  };
}
