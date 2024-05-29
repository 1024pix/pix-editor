export class Skill {
  constructor({
    id,
    name,
    description,
    hint_i18n,
    hintStatus,
    tutorialIds,
    learningMoreTutorialIds,
    pixValue,
    competenceId,
    internationalisation,
    status,
    tubeId,
    version,
    level,
  }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.hint_i18n = hint_i18n;
    this.hintStatus = hintStatus;
    this.tutorialIds = tutorialIds;
    this.learningMoreTutorialIds = learningMoreTutorialIds;
    this.pixValue = pixValue;
    this.competenceId = competenceId;
    this.status = status;
    this.tubeId = tubeId;
    this.version = version;
    this.level = level;
    this.internationalisation = internationalisation;
  }

  static get STATUSES() {
    return {
      ACTIF: 'actif',
      EN_CONSTRUCTION: 'en construction',
      ARCHIVE: 'archivé',
      PERIME: 'périmé',
    };
  }

  get isLive() {
    return [Skill.STATUSES.EN_CONSTRUCTION, Skill.STATUSES.ACTIF].includes(this.status);
  }
}
