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
  locale = 'fr-fr',
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
  }, locale);
};

buildArea.withLocaleFr = function({
  id,
  code,
  title,
  name,
  competenceIds,
  competenceAirtableIds,
  color,
  frameworkId,
  } = {}) {
  return new Area({
    id,
    code,
    titleFrFr: title,
    titleEnUs: null,
    name,
    competenceIds,
    competenceAirtableIds,
    color,
    frameworkId,
  }, 'fr');
};

buildArea.withLocaleFrFr = function({
  id,
  code,
  title,
  name,
  competenceIds,
  competenceAirtableIds,
  color,
  frameworkId,
} = {}) {
  return new Area({
    id,
    code,
    titleFrFr: title,
    titleEnUs: null,
    name,
    competenceIds,
    competenceAirtableIds,
    color,
    frameworkId,
  }, 'fr-fr');
};

buildArea.withLocaleEnUs = function({
    id,
    code,
    title,
    name,
    competenceIds,
    competenceAirtableIds,
    color,
    frameworkId,
  } = {}) {
  return new Area({
    id,
    code,
    titleFrFr: null,
    titleEnUs: title,
    name,
    competenceIds,
    competenceAirtableIds,
    color,
    frameworkId,
  }, 'en');
};

module.exports = buildArea;
