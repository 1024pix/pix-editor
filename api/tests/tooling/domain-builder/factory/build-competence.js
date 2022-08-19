const Competence = require('../../../../lib/domain/models/Competence');

const buildCompetence = function({
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
  return new Competence({
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

buildCompetence.withLocaleFr = function({
  id,
  name,
  index,
  description,
  areaId,
  skillIds,
  thematicIds,
  origin,
} = {}) {
  return new Competence({
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

buildCompetence.withLocaleFrFr = function({
  id,
  name,
  index,
  description,
  areaId,
  skillIds,
  thematicIds,
  origin,
} = {}) {
  return new Competence({
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

buildCompetence.withLocaleEnUs = function({
  id,
  name,
  index,
  description,
  areaId,
  skillIds,
  thematicIds,
  origin,
} = {}) {
  return new Competence({
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
module.exports = buildCompetence;
