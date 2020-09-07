const Area = require('../../domain/models/Area');
const areaDatasource = require('../datasources/airtable/area-datasource');

async function get() {
  const areaDataObjects = await areaDatasource.list();
  return areaDataObjects.map((areaDataObject) => {
    return new Area({
      id: areaDataObject.id,
      code: areaDataObject.code,
      name: areaDataObject.name,
      competenceIds: areaDataObject.competenceIds,
    });
  });
}

module.exports = {
  get
};
