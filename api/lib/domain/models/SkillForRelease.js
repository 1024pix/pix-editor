const generateI18NAttribute = require('../services/i18n-key-generator-for-release-models');

module.exports = class SkillForRelease {
  constructor({
    id,
    name,
    hintFrFr,
    hintEnUs,
    hintStatus,
    tutorialIds,
    learningMoreTutorialIds,
    pixValue,
    competenceId,
    status,
    tubeId,
    version,
    level,
  }) {
    this.id = id;
    this.name = name;
    this.hintFrFr = hintFrFr;
    this.hintEnUs = hintEnUs;
    this.hintStatus = hintStatus;
    this.tutorialIds = tutorialIds;
    this.learningMoreTutorialIds = learningMoreTutorialIds;
    this.pixValue = pixValue;
    this.competenceId = competenceId;
    this.status = status;
    this.tubeId = tubeId;
    this.version = version;
    this.level = level;

    const { key, value } = generateI18NAttribute('hint', { frValue: hintFrFr, enValue: hintEnUs });
    this[key] = value;
  }
};
