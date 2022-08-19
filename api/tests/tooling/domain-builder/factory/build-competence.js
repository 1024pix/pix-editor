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
  });
};

module.exports = buildCompetence;
