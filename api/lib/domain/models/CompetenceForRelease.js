const generateI18NAttribute = require('../services/i18n-key-generator-for-release-models');

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

    const { key: nameKey, value: nameValue } = generateI18NAttribute('name', { frValue: nameFrFr, enValue: nameEnUs });
    this[nameKey] = nameValue;
    const { key: descriptionKey, value: descriptionValue } = generateI18NAttribute('description', { frValue: descriptionFrFr, enValue: descriptionEnUs });
    this[descriptionKey] = descriptionValue;
  }
};
