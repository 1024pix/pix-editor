export class Translation {
  constructor({
    key,
    locale,
    value,
  } = {}) {
    this.key = key;
    this.locale = locale;
    this.value = value;
  }

  get entityId() {
    return this.key.split('.')[1];
  }

  get urlToConsult() {
    const urlToConsultField = this.key.split('.')[2];
    if (urlToConsultField === 'urlToConsult') {
      return this.value;
    } else {
      return [];
    }
  }
}
