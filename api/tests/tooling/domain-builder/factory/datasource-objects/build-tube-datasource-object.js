export function buildTubeDatasourceObject(
  {
    id = 'recTIddrkopID23Fp',
    airtableId,
    name = '@Moteur',
    competenceId = 'recsvLz0W2ShyfD63',
  } = {}) {
  return {
    id,
    airtableId: airtableId ?? id,
    name,
    competenceId,
  };
}
