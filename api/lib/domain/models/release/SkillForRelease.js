import { child } from '../../../infrastructure/logger.js';
import * as config from '../../../config.js';

import { Skill } from '../Skill.js';

const logger = child('airtable:migration', {
  event: 'migration-from-airtable',
});

export class SkillForRelease {
  #pixValue;

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
    this.#pixValue = pixValue;
    this.competenceId = competenceId;
    this.status = status;
    this.tubeId = tubeId;
    this.version = version;
    this.level = level;

    this.hint_i18n = hint_i18n;

    Object.defineProperty(this, 'pixValue', {
      enumerable: true,
      get: () => this.#pixValue,
      set: (value) => {
        if (value !== this.#pixValue) {
          logger.warn(
            {
              skillId: this.id,
              airtablePixValue: this.#pixValue,
              postgresPixValue: value,
            },
            'difference between airtable and postgres Pix value',
          );
          if (config.migrationFromAirtable.throwOnPostgresDifference) {
            console.error('difference between airtable and postgres Pix value', {
              skillId: this.id,
              airtablePixValue: this.#pixValue,
              postgresPixValue: value,
            });
            throw new Error('difference between airtable and postgres Pix value');
          }
        }
      },
    });
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
