const Thematic = require('../../../../lib/domain/models/Thematic');

const buildThematic = function({
  id = 'recFvllz2Ckz',
  name = 'Nom de la thématique',
  nameEnUs = 'Thematic\'s name',
  competenceId = 'recCompetence0',
  tubeIds = ['recTube0'],
  index = 0,
  locale = 'fr-fr',
} = {}) {
  return new Thematic({
    id,
    name,
    nameEnUs,
    competenceId,
    tubeIds,
    index,
  }, locale);
};

buildThematic.withLocaleFr = function({
  id,
  name,
  competenceId,
  tubeIds,
  index,
} = {}) {
  return new Thematic({
    id,
    name,
    nameEnUs: null,
    competenceId,
    tubeIds,
    index,
  }, 'fr');
};

buildThematic.withLocaleFrFr = function({
  id,
  name,
  competenceId,
  tubeIds,
  index,
} = {}) {
  return new Thematic({
    id,
    name,
    nameEnUs: null,
    competenceId,
    tubeIds,
    index,
  }, 'fr-fr');
};

buildThematic.withLocaleEnUs = function({
  id,
  name,
  competenceId,
  tubeIds,
  index,
} = {}) {
  return new Thematic({
    id,
    name,
    nameEnUs: name,
    competenceId,
    tubeIds,
    index,
  }, 'en');
};

module.exports = buildThematic;
