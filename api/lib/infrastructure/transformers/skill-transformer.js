import _ from 'lodash';

export function filterSkillsFields(skills) {
  return skills.map(filterSkillFields);
}

export function filterSkillFields({
  id,
  name,
  hint_i18n,
  hintStatus,
  tutorialIds,
  learningMoreTutorialIds,
  competenceId,
  pixValue,
  status,
  tubeId,
  version,
  level,
}) {
  return {
    id,
    name,
    hint_i18n,
    hintStatus,
    tutorialIds,
    learningMoreTutorialIds,
    competenceId,
    pixValue,
    status,
    tubeId,
    version,
    level,
  };
}
