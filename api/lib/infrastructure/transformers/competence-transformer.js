const _ = require('lodash');

function filterCompetencesFields(competences) {
  const fieldsToInclude = [
    'id',
    'index',
    'name',
    'nameFrFr',
    'nameEnUs',
    'description',
    'descriptionFrFr',
    'descriptionEnUs',
    'areaId',
    'skillIds',
    'origin',
  ];
  return competences.map((competence) => _.pick(competence, fieldsToInclude));
}

module.exports = {
  filterCompetencesFields,
};
