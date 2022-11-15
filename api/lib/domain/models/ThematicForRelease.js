const generateI18NAttribute = require('../services/i18n-key-generator-for-release-models');

module.exports = class ThematicForRelease {
  constructor({
    id,
    name,
    nameEnUs,
    index,
    competenceId,
    tubeIds,
  }) {
    this.id = id;
    this.name = name;
    this.nameEnUs = nameEnUs;
    this.index = index;
    this.competenceId = competenceId;
    this.tubeIds = tubeIds;

    const { key, value } = generateI18NAttribute('name', { frValue: name, enValue: nameEnUs });
    this[key] = value;
  }
};
