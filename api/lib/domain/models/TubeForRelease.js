const generateI18NAttribute = require('../services/i18n-key-generator-for-release-models');

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
    isMobileCompliant,
    isTabletCompliant,
  }) {
    this.id = id;
    this.name = name;
    this.title = title;
    this.description = description;
    this.practicalTitleFrFr = practicalTitleFrFr;
    this.practicalTitleEnUs = practicalTitleEnUs;
    this.practicalDescriptionFrFr = practicalDescriptionFrFr;
    this.practicalDescriptionEnUs = practicalDescriptionEnUs;
    this.competenceId = competenceId;
    this.isMobileCompliant = isMobileCompliant;
    this.isTabletCompliant = isTabletCompliant;

    const { key: practicalTitleKey, value: practicalTitleValue } = generateI18NAttribute('practicalTitle', { frValue: practicalTitleFrFr, enValue: practicalTitleEnUs });
    this[practicalTitleKey] = practicalTitleValue;
    const { key: practicalDescriptionKey, value: practicalDescriptionValue } = generateI18NAttribute('practicalDescription', { frValue: practicalDescriptionFrFr, enValue: practicalDescriptionEnUs });
    this[practicalDescriptionKey] = practicalDescriptionValue;
  }
};
