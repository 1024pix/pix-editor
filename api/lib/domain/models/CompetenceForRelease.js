module.exports = class CompetenceForRelease {
  constructor(
    {
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
    } = {},
    locale
  ) {
    this.id = id;
    this.index = index;
    this.areaId = areaId;
    this.skillIds = skillIds;
    this.thematicIds = thematicIds;
    this.origin = origin;

    if (!locale) {
      this.name = name;
      this.nameFrFr = nameFrFr;
      this.nameEnUs = nameEnUs;
      this.description = description;
      this.descriptionFrFr = descriptionFrFr;
      this.descriptionEnUs = descriptionEnUs;
    }

    if (locale === 'fr-fr' || locale === 'fr') {
      this.name = nameFrFr;
      this.nameFrFr = nameFrFr;
      this.description = descriptionFrFr;
      this.descriptionFrFr = descriptionFrFr;
    }

    if (locale === 'en') {
      this.name = nameEnUs;
      this.nameEnUs = nameEnUs;
      this.description = descriptionEnUs;
      this.descriptionEnUs = descriptionEnUs;
    }
  }
};
