const AreaForRelease = require('../../../../lib/domain/models/release/AreaForRelease');

const buildAreaForRelease = function({
  id = 'recArea1',
  name = 'nameArea1',
  code = 'codeArea1',
  color = 'colorArea1',
  competenceIds = ['recComp1', 'recComp2'],
  competenceAirtableIds = ['recAirComp1', 'recAirComp2'],
  frameworkId = 'recFramework1',
  title_i18n = { fr: 'titreArea1', en: 'titleArea1' },
} = {}) {
  return new AreaForRelease({
    id,
    code,
    title_i18n,
    name,
    competenceIds,
    competenceAirtableIds,
    color,
    frameworkId,
  });
};

module.exports = buildAreaForRelease;
