import _ from 'lodash';

export function filterSkillsFields(skills) {
  const fieldsToInclude = [
    'id',
    'name',
    'hint_i18n',
    'hintStatus',
    'tutorialIds',
    'learningMoreTutorialIds',
    'competenceId',
    'pixValue',
    'status',
    'tubeId',
    'version',
    'level'
  ];
  return skills.map((skill) => _.pick(skill, fieldsToInclude));
}
