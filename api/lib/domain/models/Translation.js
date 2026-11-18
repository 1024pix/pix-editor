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
  }

  get entityId() {
    return this.key.split('.')[1];
  }

  get model() {
    return this.key.split('.')[0];
  }
}
