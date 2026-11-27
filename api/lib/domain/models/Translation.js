import { logger } from '../../infrastructure/logger.js';

export class Translation {
  /**
   * @param {object} params
   * @param {string} params.key
   * @param {string} params.locale
   * @param {string} params.value
   */
  constructor({ key, locale, value } = {}) {
    this.key = key;
    this.locale = locale;
    this.value = value ?? '';
    this.#exorciseDevilApostrophe();
  }

  #exorciseDevilApostrophe() {
    const ESCAPED_CELL_REGEX = /^'(?=[-@=+])/;
    const IMPACTED_TRANSLATIONS_REGEX = /(proposals|solution)$/;

    if (IMPACTED_TRANSLATIONS_REGEX.test(this.key) && ESCAPED_CELL_REGEX.test(this.value)) {
      logger.info(`The key and value of translation about to be exorcised: ${this.key}, ${this.value}`);
      this.value = this.value.replace(/^\'/, '');
    }
  }

  get entityId() {
    return this.key.split('.')[1];
  }

  get model() {
    return this.key.split('.')[0];
  }
}
