export function buildTubeDatasourceObject(
  {
    id = 'recTIddrkopID23Fp',
    airtableId,
    name = '@Moteur',
    competenceId = 'recsvLz0W2ShyfD63',
    index = 0,
  } = {}) {
  return {
    id,
    airtableId: airtableId ?? id,
    name,
    competenceId,
    index,
  };
}
