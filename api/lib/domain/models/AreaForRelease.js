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

    this.title_i18n = _computeTitleForI18N({ titleFrFr, titleEnUs });
  }
};

function _computeTitleForI18N({ titleFrFr, titleEnUs }) {
  return {
    fr: titleFrFr,
    en: titleEnUs,
  };
}
