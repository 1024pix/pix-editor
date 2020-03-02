const areaDatasource = require('../datasources/airtable/area-datasource');

async function list() {
  const areaDataObjects = await areaDatasource.list();
  return areaDataObjects.map((areaDataObject) => ({
    id: areaDataObject.id,
    code: areaDataObject.code,
    name: areaDataObject.name,
    title: areaDataObject.title,
    color: areaDataObject.color,
    competences: []
  }));
}

module.exports = {
  list,
};
