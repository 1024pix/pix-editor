export function buildFrameworkDatasourceObject({
  id = 'framework123',
  name = 'Un référentiel',
  areaIds = ['area456', 'area789'],
} = {}) {
  return {
    id,
    name,
    areaIds,
  };
}
