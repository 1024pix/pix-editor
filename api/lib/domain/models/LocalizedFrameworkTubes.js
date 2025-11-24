import { InvalidLocalizedFrameworkTubesError } from '../errors.js';

export class LocalizedFrameworkTubes {
  constructor({ id, tubeId, maxLevel, locale }) {
    this.id = id;
    this.tubeId = tubeId;
    this.maxLevel = maxLevel;
    this.locale = locale;
  }

  validate() {
    if (this.maxLevel < 0 || this.maxLevel > 8) {
      throw new InvalidLocalizedFrameworkTubesError('MaxLevel out of range');
    }
  }
}
