import { Skill } from '../../../../../lib/domain/models/index.js';

export function buildSkillDatasourceObject(
  {
    id = 'skillIdPersistant',
    airtableId = 'recTIddrkopID28Ep',
    name = '@accesDonnées1',
    hintStatus = Skill.HINT_STATUSES.VALIDE,
    tutorialIds = ['receomyzL0AmpMFGw'],
    learningMoreTutorialIds = ['recQbjXNAPsVJthXh', 'rec3DkUX0a6RNi2Hz'],
    competenceId = 'recofJCxg0NqTqTdP',
    pixValue = 2.4,
    status = 'actif',
    tubeId = 'recTU0X22abcdefgh',
    description = 'skill description',
    level = 5,
    internationalisation = Skill.INTERNATIONALISATIONS.MONDE,
    version = 1,
  } = {}) {
  return {
    id,
    airtableId,
    name,
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
  };
}
