import { SkillForRelease } from '../../../../lib/domain/models/release/index.js';

export function buildSkillForRelease({
  id = 'recTIddrkopID28Ep',
  name = '@accesDonnées1',
  hint_i18n = {
    fr: 'Peut-on géo-localiser un téléphone lorsqu’il est éteint ?',
    en: 'Can we geo-locate a rabbit on the ice floe?',
  },
  hintStatus = SkillForRelease.HINT_STATUSES.VALIDE,
  tutorialIds = ['receomyzL0AmpMFGw'],
  learningMoreTutorialIds = ['recQbjXNAPsVJthXh', 'rec3DkUX0a6RNi2Hz'],
  competenceId = 'recofJCxg0NqTqTdP',
  pixValue = 2.4,
  status = 'actif',
  tubeId = 'recTU0X22abcdefgh',
  description = 'skill description',
  level = 5,
  internationalisation = SkillForRelease.INTERNATIONALISATIONS.MONDE,
  version = 1,
} = {}) {
  return new SkillForRelease({
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
    description,
    level,
    internationalisation,
    version,
  });
}
