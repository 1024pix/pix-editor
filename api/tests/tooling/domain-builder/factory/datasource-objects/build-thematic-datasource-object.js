export function buildThematicDatasourceObject(
  {
    id = 'recFvllz2Ckz',
    airtableId,
    competenceId = 'recCompetence0',
    tubeIds = ['recTube0'],
    index = 0
  } = {}) {
  return {
    id,
    airtableId: airtableId ?? id,
    competenceId,
    tubeIds,
    index,
  };
}
