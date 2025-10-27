export function buildTubeDatasourceObject({
  id = 'recTIddrkopID23Fp',
  airtableId,
  name = '@Moteur',
  index = 1,
  thematicAirtableId = 'recAirFlqfqwl1231bd1',
  thematicId = 'thematicFlqfqwl1231bd1',
  competenceAirtableId = 'recAirsvLz0W2ShyfD63',
  competenceId = 'recsvLz0W2ShyfD63',
  skillAirtableIds = ['recSkill1', 'recSkill2'],
  skillIds = ['skill1', 'skill2'],
} = {}) {
  return {
    id,
    airtableId: airtableId ?? id,
    name,
    index,
    thematicId,
    thematicAirtableId,
    competenceAirtableId,
    competenceId,
    skillAirtableIds,
    skillIds,
  };
}
