export function buildArea({
  id,
  airtableId = id,
  competenceIds,
  competenceAirtableIds,
  code,
  color,
  frameworkId,
} = {}) {
  return {
    id: airtableId,
    fields: {
      'id persistant': id,
      'Competences (identifiants) (id persistant)': competenceIds,
      'Competences (identifiants)': competenceAirtableIds,
      Code: code,
      Couleur: color,
      Referentiel: [frameworkId],
    },
  };
}
