const AreaForRelease = require('../../../../lib/domain/models/AreaForRelease');

const buildAreaForRelease = function({
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
  return new AreaForRelease({
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

buildAreaForRelease.withLocaleFr = function({
  id,
  code,
  title,
  name,
  competenceIds,
  competenceAirtableIds,
  color,
  frameworkId,
} = {}) {
  return new AreaForRelease({
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

buildAreaForRelease.withLocaleFrFr = function({
  id,
  code,
  title,
  name,
  competenceIds,
  competenceAirtableIds,
  color,
  frameworkId,
} = {}) {
  return new AreaForRelease({
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

buildAreaForRelease.withLocaleEnUs = function({
  id,
  code,
  title,
  name,
  competenceIds,
  competenceAirtableIds,
  color,
  frameworkId,
} = {}) {
  return new AreaForRelease({
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

module.exports = buildAreaForRelease;
