const Thematic = require('../../../../lib/domain/models/Thematic');

const buildThematic = function({
  id = 'recFvllz2Ckz',
  name = 'Nom de la thématique',
  nameEnUs = 'Thematic\'s name',
  competenceId = 'recCompetence0',
  tubeIds = ['recTube0'],
  index = 0,
} = {}) {
  return new Thematic({
    id,
    name,
    nameEnUs,
    competenceId,
    tubeIds,
    index,
  });
};

module.exports = buildThematic;
