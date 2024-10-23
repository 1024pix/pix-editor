export function buildTubeDatasourceObject(
  {
    id = 'recTIddrkopID23Fp',
    airtableId,
    name = '@Moteur',
    index = 1,
    competenceId = 'recsvLz0W2ShyfD63',
  } = {}) {
  return {
    id,
    airtableId: airtableId ?? id,
    name,
    index,
    competenceId,
  };
}
