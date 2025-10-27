export function buildTube({
  id,
  airtableId = id,
  name,
  index,
  thematicAirtableId,
  thematicId,
  competenceAirtableId,
  competenceId,
  skillAirtableIds,
  skillIds,
} = {}) {
  return {
    id: airtableId,
    fields: {
      'id persistant': id,
      Nom: name,
      Index: index,
      Thematique: [thematicAirtableId],
      'Thematique (id persistant)': [thematicId],
      Competences: [competenceAirtableId],
      'Competences (id persistant)': [competenceId],
      Acquis: skillAirtableIds,
      'Acquis (id persistant)': skillIds,
    },
  };
}
