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
    if (this.key.endsWith('proposals')) {
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
