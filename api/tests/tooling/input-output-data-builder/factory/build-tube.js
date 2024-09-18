export function buildTube({
  id = 'areaid1',
  name,
  practicalTitle_i18n: {
    fr: practicalTitleFrFr,
    en: practicalTitleEnUs,
  } = {},
  practicalDescription_i18n: {
    fr: practicalDescriptionFrFr,
    en: practicalDescriptionEnUs,
  } = {},
  competenceId,
  index,
} = {}) {
  return {
    id,
    'fields': {
      'id persistant': id,
      'Nom': name,
      'Titre pratique fr-fr': practicalTitleFrFr,
      'Titre pratique en-us': practicalTitleEnUs,
      'Description pratique fr-fr': practicalDescriptionFrFr,
      'Description pratique en-us': practicalDescriptionEnUs,
      'Competences (id persistant)': [competenceId],
      'Index': index,
    },
  };
}
