import _ from 'lodash';

export function filterCompetencesFields(competences) {
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
