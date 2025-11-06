export class SkillForReplication {
  constructor({
    id,
    description,
    hintStatus,
    hint_i18n,
    internationalisation,
    learningMoreTutorialIds,
    level,
    name,
    pixValue,
    status,
    tubeId,
    tutorialIds,
    version,
    createdAt,
    activatedAt,
    archivedAt,
    obsoletedAt,
  }) {
    this.id = id;
    this.description = description;
    this.hintStatus = hintStatus;
    this.hint_i18n = hint_i18n;
    this.internationalisation = internationalisation;
    this.learningMoreTutorialIds = learningMoreTutorialIds;
    this.level = level;
    this.name = name;
    this.pixValue = pixValue;
    this.status = status;
    this.tubeId = tubeId;
    this.tutorialIds = tutorialIds;
    this.version = version;
    this.createdAt = createdAt;
    this.activatedAt = activatedAt;
    this.archivedAt = archivedAt;
    this.obsoletedAt = obsoletedAt;
  }
}
