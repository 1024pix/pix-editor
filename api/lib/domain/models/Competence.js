export class Competence {
  constructor({
    id,
    airtableId,
    index,
    origin,
    areaId,
    areaAirtableId,
    thematicIds,
    thematicAirtableIds,
    tubeAirtableIds,
    tubeIds,
    skillIds,
    name_i18n,
    description_i18n,
  }) {
    this.id = id;
    this.airtableId = airtableId;
    this.index = index;
    this.origin = origin;
    this.areaId = areaId;
    this.areaAirtableId = areaAirtableId;
    this.thematicIds = thematicIds;
    this.thematicAirtableIds = thematicAirtableIds;
    this.tubeAirtableIds = tubeAirtableIds;
    this.tubeIds = tubeIds;
    this.skillIds = skillIds;
    this.name_i18n = name_i18n;
    this.description_i18n = description_i18n;
  }

  update({ name_i18n, description_i18n }) {
    this.name_i18n = name_i18n;
    this.description_i18n = description_i18n;
  }
}
