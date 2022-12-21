module.exports = class CompetenceForRelease {
  constructor({
    id,
    name,
    name_i18n,
    index,
    description,
    description_i18n,
    areaId,
    skillIds,
    thematicIds,
    origin,
  }) {
    this.id = id;
    this.name = name;
    this.index = index;
    this.description = description;
    this.areaId = areaId;
    this.skillIds = skillIds;
    this.thematicIds = thematicIds;
    this.origin = origin;
    this.name_i18n = name_i18n;
    this.description_i18n = description_i18n;
  }
};
