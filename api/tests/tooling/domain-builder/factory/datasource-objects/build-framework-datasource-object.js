export function buildFrameworkDatasourceObject({
  id = 'framework123',
  name = 'Un référentiel',
  areaAirtableIds = ['recArea456', 'recArea789'],
  areaIds = ['area456', 'area789'],
} = {}) {
  return {
    id,
    name,
    areaAirtableIds,
    areaIds,
  };
}
