export function buildTubeDatasourceObject({
  id = 'recTIddrkopID23Fp',
  name = '@Moteur',
  index = 1,
  thematicId = 'thematicFlqfqwl1231bd1',
  competenceId = 'recsvLz0W2ShyfD63',
  skillIds = ['skill1', 'skill2'],
} = {}) {
  return {
    id,
    airtableId: id,
    name,
    index,
    thematicId,
    thematicAirtableId: thematicId,
    competenceAirtableId: competenceId,
    competenceId,
    skillAirtableIds: skillIds,
    skillIds,
  };
}
