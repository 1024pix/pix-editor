module.exports = class TubeForRelease {
  constructor({
    id,
    name,
    title,
    description,
    practicalTitleFrFr,
    practicalTitleEnUs,
    practicalDescriptionFrFr,
    practicalDescriptionEnUs,
    competenceId,
  } = {}, locale) {
    this.id = id;
    this.name = name;
    this.title = title;
    this.description = description;
    this.competenceId = competenceId;

    if (!locale) {
      this.practicalTitleFrFr = practicalTitleFrFr;
      this.practicalDescriptionFrFr = practicalDescriptionFrFr;
      this.practicalTitleEnUs = practicalTitleEnUs;
      this.practicalDescriptionEnUs = practicalDescriptionEnUs;
    }

    if (locale === 'fr' || locale === 'fr-fr') {
      this.practicalTitle = practicalTitleFrFr;
      this.practicalTitleFrFr = practicalTitleFrFr;
      this.practicalDescription = practicalDescriptionFrFr;
      this.practicalDescriptionFrFr = practicalDescriptionFrFr;
    }

    if (locale === 'en') {
      this.practicalTitle = practicalTitleEnUs;
      this.practicalTitleEnUs = practicalTitleEnUs;
      this.practicalDescription = practicalDescriptionEnUs;
      this.practicalDescriptionEnUs = practicalDescriptionEnUs;
    }
  }
};
