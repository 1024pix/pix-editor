import { child } from '../../../infrastructure/logger.js';
import * as config from '../../../config.js';

const logger = child('airtable:migration', { event: 'migration-from-airtable' });

export class SkillForReplication {
  #pixValue;

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
    this.#pixValue = pixValue;
    this.status = status;
    this.tubeId = tubeId;
    this.tutorialIds = tutorialIds;
    this.version = version;
    this.createdAt = createdAt;
    this.activatedAt = activatedAt;
    this.archivedAt = archivedAt;
    this.obsoletedAt = obsoletedAt;

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
              filename: 'SkillForReplication',
            },
            'difference between airtable and postgres Pix value',
          );
          if (config.migrationFromAirtable.throwOnPostgresDifference) {
            console.error('difference between airtable and postgres Pix value', {
              skillId: this.id,
              airtablePixValue: this.#pixValue,
              postgresPixValue: value,
              filename: 'SkillForReplication',
            });
            throw new Error('difference between airtable and postgres Pix value');
          }
        }
      },
    });
  }
}
