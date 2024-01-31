export function buildArea({
  id,
  competenceIds,
  competenceAirtableIds,
  code,
  color,
  frameworkId,
} = {}) {
  return {
    id,
    'fields': {
      'id persistant': id,
      'Competences (identifiants) (id persistant)': competenceIds,
      'Competences (identifiants)': competenceAirtableIds,
      'Code': code,
      'Couleur': color,
      'Referentiel': [frameworkId],
    },
  };
}
