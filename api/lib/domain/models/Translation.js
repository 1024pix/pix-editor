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
}
