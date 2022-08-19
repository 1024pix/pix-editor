const Area = require('../../../../lib/domain/models/Area');

const buildArea = function({
  id = 'recArea1',
  name = 'nameArea1',
  code = 'codeArea1',
  color = 'colorArea1',
  competenceIds = ['recComp1', 'recComp2'],
  competenceAirtableIds = ['recAirComp1', 'recAirComp2'],
  frameworkId = 'recFramework1',
  titleFrFr = 'titreArea1',
  titleEnUs = 'titleArea1',
} = {}) {
  return new Area({
    id,
    code,
    titleFrFr,
    titleEnUs,
    name,
    competenceIds,
    competenceAirtableIds,
    color,
    frameworkId,
  });
};

module.exports = buildArea;
