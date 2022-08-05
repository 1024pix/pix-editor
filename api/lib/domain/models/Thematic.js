module.exports = class Thematic {
  constructor({
    id,
    name,
    nameEnUs,
    index,
    competenceId,
    tubeIds,
  } = {}, locale) {
    this.id = id;
    this.index = index;
    this.competenceId = competenceId;
    this.tubeIds = tubeIds;

    if (!locale) {
      this.name = name;
      this.nameEnUs = nameEnUs;
    }

    if (locale === 'en') {
      this.name = nameEnUs;
      this.nameEnUs = nameEnUs;
    }

    if (locale === 'fr-fr' || locale === 'fr') {
      this.name = name;
    }
  }
};
