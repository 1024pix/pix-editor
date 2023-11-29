export class Competence {
  constructor({
    id,
    index,
    origin,
    areaId,
    thematicIds,
    skillIds,
    name_i18n,
    description_i18n,
  }) {
    this.id = id;
    this.index = index;
    this.origin = origin;
    this.areaId = areaId;
    this.thematicIds = thematicIds;
    this.skillIds = skillIds;
    this.name_i18n = name_i18n;
    this.description_i18n = description_i18n;
  }
}
