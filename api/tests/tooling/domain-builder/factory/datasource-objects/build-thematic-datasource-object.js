export function buildThematicDatasourceObject({
  id = 'recFvllz2Ckz',
  competenceId = 'recCompetence0',
  tubeIds = ['recTube0'],
  index = 0,
} = {}) {
  return {
    id,
    airtableId: id,
    competenceId,
    competenceAirtableId: competenceId,
    tubeIds,
    tubeAirtableIds: tubeIds,
    index,
  };
}
