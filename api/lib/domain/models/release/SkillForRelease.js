import { Skill } from '../Skill.js';

export class SkillForRelease {
  constructor({
    id,
    name,
    hint_i18n,
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
    this.hintStatus = hintStatus;
    this.tutorialIds = tutorialIds;
    this.learningMoreTutorialIds = learningMoreTutorialIds;
    this.pixValue = pixValue;
    this.competenceId = competenceId;
    this.status = status;
    this.tubeId = tubeId;
    this.version = version;
    this.level = level;

    this.hint_i18n = hint_i18n;
  }

  static get STATUSES() {
    return Skill.STATUSES;
  }

  static get HINT_STATUSES() {
    return Skill.HINT_STATUSES;
  }

  static get INTERNATIONALISATIONS() {
    return Skill.INTERNATIONALISATIONS;
  }

  canExportForTranslation() {
    return this.status === SkillForRelease.STATUSES.ACTIF;
  }
}
