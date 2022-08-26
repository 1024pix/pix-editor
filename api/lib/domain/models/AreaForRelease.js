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
  } = {}, locale) {
    this.id = id;
    this.code = code;
    this.competenceIds = competenceIds;
    this.name = name;
    this.competenceAirtableIds = competenceAirtableIds;
    this.color = color;
    this.frameworkId = frameworkId;

    if (!locale) {
      this.titleFrFr = titleFrFr;
      this.titleEnUs = titleEnUs;
    }

    if (locale === 'fr-fr' || locale === 'fr') {
      this.title = titleFrFr;
      this.titleFrFr = titleFrFr;
    }

    if (locale === 'en') {
      this.title = titleEnUs;
      this.titleEnUs = titleEnUs;
    }
  }
};
