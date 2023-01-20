const ThematicForRelease = require('../../../../lib/domain/models/ThematicForRelease');

const buildThematicForRelease = function({
  id = 'recFvllz2Ckz',
  name_i18n = {
    fr: 'Nom de la thématique',
    en: 'Thematic\'s name',
  },
  competenceId = 'recCompetence0',
  tubeIds = ['recTube0'],
  index = 0,
} = {}) {
  return new ThematicForRelease({
    id,
    name_i18n,
    competenceId,
    tubeIds,
    index,
  });
};

module.exports = buildThematicForRelease;
