const generateI18NAttribute = require('../services/i18n-key-generator-for-release-models');

module.exports = class AreaForRelease {
  constructor({
    id,
    code,
    titleFrFr,
    titleEnUs,
    name,
    competenceIds,
    competenceAirtableIds,
    color,
    frameworkId,
  }) {
    this.id = id;
    this.code = code;
    this.titleFrFr = titleFrFr;
    this.titleEnUs = titleEnUs;
    this.competenceIds = competenceIds;
    this.name = name;
    this.competenceAirtableIds = competenceAirtableIds;
    this.color = color;
    this.frameworkId = frameworkId;
    const { key, value } = generateI18NAttribute('title', { frValue: titleFrFr, enValue: titleEnUs });
    this[key] = value;
  }
};
