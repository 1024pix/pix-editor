const CompetenceForRelease = require('../../../../lib/domain/models/CompetenceForRelease');

const buildCompetenceForRelease = function({
  id = 'recCompetence1',
  name = 'nameCompetence1',
  nameFrFr = 'nameFrCompetence1',
  nameEnUs = 'nameUsCompetence1',
  index = '1.1',
  description = 'descriptionCompetence1',
  descriptionFrFr = 'descriptionFrCompetence1',
  descriptionEnUs = 'descriptionUsCompetence1',
  areaId = 'recArea1',
  skillIds = ['recSkill1', 'recSkill2'],
  thematicIds = ['recThematic1'],
  origin = 'Pix',
  locale = 'fr-fr',
} = {}) {
  return new CompetenceForRelease({
    id,
    name,
    nameFrFr,
    nameEnUs,
    index,
    description,
    descriptionFrFr,
    descriptionEnUs,
    areaId,
    skillIds,
    thematicIds,
    origin,
  }, locale);
};

buildCompetenceForRelease.withLocaleFr = function({
  id,
  name,
  index,
  description,
  areaId,
  skillIds,
  thematicIds,
  origin,
} = {}) {
  return new CompetenceForRelease({
    id,
    name: null,
    nameFrFr: name,
    nameEnUs: null,
    index,
    description: null,
    descriptionFrFr: description,
    descriptionEnUs: null,
    areaId,
    skillIds,
    thematicIds,
    origin,
  }, 'fr');
};

buildCompetenceForRelease.withLocaleFrFr = function({
  id,
  name,
  index,
  description,
  areaId,
  skillIds,
  thematicIds,
  origin,
} = {}) {
  return new CompetenceForRelease({
    id,
    name: null,
    nameFrFr: name,
    nameEnUs: null,
    index,
    description: null,
    descriptionFrFr: description,
    descriptionEnUs: null,
    areaId,
    skillIds,
    thematicIds,
    origin,
  }, 'fr-fr');
};

buildCompetenceForRelease.withLocaleEnUs = function({
  id,
  name,
  index,
  description,
  areaId,
  skillIds,
  thematicIds,
  origin,
} = {}) {
  return new CompetenceForRelease({
    id,
    name: null,
    nameFrFr: null,
    nameEnUs: name,
    index,
    description: null,
    descriptionFrFr: null,
    descriptionEnUs: description,
    areaId,
    skillIds,
    thematicIds,
    origin,
  }, 'en');
};
module.exports = buildCompetenceForRelease;
