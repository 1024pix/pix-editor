const _ = require('lodash');
const competenceDatasource = require('../datasources/airtable/competence-datasource');
const areaDatasource = require('../datasources/airtable/area-datasource');

function _toDomain(competenceData, areaDatas) {
  const areaData = competenceData.areaId && _.find(areaDatas, { id: competenceData.areaId });
  return {
    id: competenceData.id,
    name: competenceData.name,
    index: competenceData.index,
    description: competenceData.description,
    origin: competenceData.origin,
    skills: competenceData.skillIds,
    area: areaData && {
      id: areaData.id,
      code: areaData.code,
      title: areaData.title,
      color: areaData.color,
    },
  };
}

module.exports = {

  list() {
    return Promise.all([competenceDatasource.list(), areaDatasource.list()])
      .then(([competenceDatas, areaDatas]) => {
        return _.sortBy(
          competenceDatas.map((competenceData) => _toDomain(competenceData, areaDatas)),
          'index'
        );
      });
  }
};
