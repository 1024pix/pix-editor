const areaDatasource = require('../datasources/airtable/area-datasource');
const competenceRepository = require('./competence-repository');
const { filter, map } = require('lodash');

async function _list() {
  const areaDataObjects = await areaDatasource.list();
  return map(areaDataObjects, (areaDataObject) => ({
    id: areaDataObject.id,
    code: areaDataObject.code,
    name: areaDataObject.name,
    title: areaDataObject.title,
    color: areaDataObject.color,
  }));
}

async function list() {
  return Promise.all([_list(), competenceRepository.list()])
    .then(([areas, competences]) => {
      areas.forEach((area) => {
        area.competences = filter(competences, { area: { id: area.id } });
      });
      return areas;
    });
}

module.exports = {
  list,
};
