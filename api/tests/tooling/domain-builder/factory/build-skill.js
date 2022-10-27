const Skill = require('../../../../lib/domain/models/Skill');

const buildSkill = function({
  id = 'recTIddrkopID28Ep',
  name = '@accesDonnées1',
  hintFrFr = 'Peut-on géo-localiser un téléphone lorsqu’il est éteint ?',
  hintEnUs = 'Can we geo-locate a rabbit on the ice floe?',
  hintStatus = 'Validé',
  tutorialIds = ['receomyzL0AmpMFGw'],
  learningMoreTutorialIds = ['recQbjXNAPsVJthXh', 'rec3DkUX0a6RNi2Hz'],
  competenceId = 'recofJCxg0NqTqTdP',
  pixValue = 2.4,
  status = 'actif',
  tubeId = 'recTU0X22abcdefgh',
  description = 'skill description',
  level = 5,
  internationalisation = 'Monde',
  version = 1,
} = {}) {
  return new Skill({
    id,
    name,
    hintFrFr,
    hintEnUs,
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
};

module.exports = buildSkill;
