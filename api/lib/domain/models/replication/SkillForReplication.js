export class SkillForReplication {
  constructor({
    id,
    name,
    description,
    level,
    tubeId,
    status,
    pixValue,
    hint_i18n,
    hintStatus,
    tutorialIds,
    learningMoreTutorialIds,
    internationalisation,
    version,
  }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.level = level;
    this.tubeId = tubeId;
    this.status = status;
    this.pixValue = pixValue;
    this.hint_i18n = hint_i18n;
    this.hintStatus = hintStatus;
    this.tutorialIds = tutorialIds;
    this.learningMoreTutorialIds = learningMoreTutorialIds;
    this.internationalisation = internationalisation;
    this.version = version;
  }
}
