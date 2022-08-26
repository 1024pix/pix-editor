const ThematicForRelease = require('../../../../lib/domain/models/ThematicForRelease');

const buildThematicForRelease = function({
  id = 'recFvllz2Ckz',
  name = 'Nom de la thématique',
  nameEnUs = 'Thematic\'s name',
  competenceId = 'recCompetence0',
  tubeIds = ['recTube0'],
  index = 0,
  locale = 'fr-fr',
} = {}) {
  return new ThematicForRelease({
    id,
    name,
    nameEnUs,
    competenceId,
    tubeIds,
    index,
  }, locale);
};

buildThematicForRelease.withLocaleFr = function({
  id,
  name,
  competenceId,
  tubeIds,
  index,
} = {}) {
  return new ThematicForRelease({
    id,
    name,
    nameEnUs: null,
    competenceId,
    tubeIds,
    index,
  }, 'fr');
};

buildThematicForRelease.withLocaleFrFr = function({
  id,
  name,
  competenceId,
  tubeIds,
  index,
} = {}) {
  return new ThematicForRelease({
    id,
    name,
    nameEnUs: null,
    competenceId,
    tubeIds,
    index,
  }, 'fr-fr');
};

buildThematicForRelease.withLocaleEnUs = function({
  id,
  name,
  competenceId,
  tubeIds,
  index,
} = {}) {
  return new ThematicForRelease({
    id,
    name,
    nameEnUs: name,
    competenceId,
    tubeIds,
    index,
  }, 'en');
};

module.exports = buildThematicForRelease;
