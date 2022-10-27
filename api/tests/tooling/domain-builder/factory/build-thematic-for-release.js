const ThematicForRelease = require('../../../../lib/domain/models/ThematicForRelease');

const buildThematicForRelease = function({
  id = 'recFvllz2Ckz',
  name = 'Nom de la thématique',
  nameEnUs = 'Thematic\'s name',
  competenceId = 'recCompetence0',
  tubeIds = ['recTube0'],
  index = 0,
} = {}) {
  return new ThematicForRelease({
    id,
    name,
    nameEnUs,
    competenceId,
    tubeIds,
    index,
  });
};

module.exports = buildThematicForRelease;
