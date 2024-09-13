import _ from 'lodash';

export function filterThematicsFields(thematics) {
  const fieldsToInclude = [
    'id',
    'name_i18n',
    'index',
    'competenceId',
    'tubeIds',
  ];

  return thematics.map((thematic) => _.pick(thematic, fieldsToInclude));
}
