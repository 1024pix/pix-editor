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
  } = {}, locale) {
    this.id = id;
    this.name = name;
    this.hintStatus = hintStatus;
    this.tutorialIds = tutorialIds;
    this.learningMoreTutorialIds = learningMoreTutorialIds;
    this.pixValue = pixValue;
    this.competenceId = competenceId;
    this.status = status;
    this.tubeId = tubeId;
    this.version = version;
    this.level = level;

    if (!locale) {
      this.hintFrFr = hintFrFr;
      this.hintEnUs = hintEnUs;
    }

    if (locale === 'fr' || locale === 'fr-fr') {
      this.hintFrFr = hintFrFr;
      this.hint = hintFrFr;
    }

    if (locale === 'en') {
      this.hintEnUs = hintEnUs;
      this.hint = hintEnUs;
    }
  }
};
