export class CompetenceForRelease {
  constructor({
    id,
    name_i18n,
    index,
    description_i18n,
    areaId,
    skillIds,
    thematicIds,
    origin,
  }) {
    this.id = id;
    this.index = index;
    this.areaId = areaId;
    this.skillIds = skillIds;
    this.thematicIds = thematicIds;
    this.origin = origin;
    this.name_i18n = name_i18n;
    this.description_i18n = description_i18n;
  }
}
