module.exports = class CompetenceForRelease {
  constructor({
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
  }) {
    this.id = id;
    this.name = name;
    this.nameFrFr = nameFrFr;
    this.nameEnUs = nameEnUs;
    this.index = index;
    this.description = description;
    this.descriptionFrFr = descriptionFrFr;
    this.descriptionEnUs = descriptionEnUs;
    this.areaId = areaId;
    this.skillIds = skillIds;
    this.thematicIds = thematicIds;
    this.origin = origin;
  }
};
