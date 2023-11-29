import { Skill } from '../../../../lib/domain/models/Skill.js';

export function buildSkill({
  id = 'recTIddrkopID28Ep',
  name = '@accesDonnées1',
  description = 'skill description',
  hint_i18n = {
    fr: 'Peut-on géo-localiser un téléphone lorsqu’il est éteint ?',
    en: 'Can we geo-locate a rabbit on the ice floe?',
  },
  hintStatus = 'Validé',
  tutorialIds = ['receomyzL0AmpMFGw'],
  learningMoreTutorialIds = ['recQbjXNAPsVJthXh', 'rec3DkUX0a6RNi2Hz'],
  competenceId = 'recofJCxg0NqTqTdP',
  pixValue = 2.4,
  status = 'actif',
  tubeId = 'recTU0X22abcdefgh',
  level = 5,
  internationalisation = 'Monde',
  version = 1,
} = {}) {
  return new Skill({
    id,
    name,
    description,
    hint_i18n,
    hintStatus,
    tutorialIds,
    learningMoreTutorialIds,
    competenceId,
    pixValue,
    status,
    tubeId,
    level,
    internationalisation,
    version,
  });
}
