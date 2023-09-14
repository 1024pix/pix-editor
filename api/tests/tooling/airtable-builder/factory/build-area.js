export function buildArea({
  id,
  competenceIds,
  competenceAirtableIds,
  code,
  name,
  color,
  frameworkId,
  title_i18n: { fr: titleFrFr, en: titleEnUs },
} = {}) {
  return {
    id,
    'fields': {
      'id persistant': id,
      'Competences (identifiants) (id persistant)': competenceIds,
      'Competences (identifiants)': competenceAirtableIds,
      'Titre fr-fr': titleFrFr,
      'Titre en-us': titleEnUs,
      'Code': code,
      'Nom': name,
      'Couleur': color,
      'Referentiel': [frameworkId],
    },
  };
}
