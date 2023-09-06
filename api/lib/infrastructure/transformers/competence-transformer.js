const _ = require('lodash');

function filterCompetencesFields(competences) {
  const fieldsToInclude = [
    'id',
    'index',
    'areaId',
    'skillIds',
    'thematicIds',
    'origin',
  ];
  return competences.map((competence) => _.pick(competence, fieldsToInclude));
}

module.exports = {
  filterCompetencesFields,
};
