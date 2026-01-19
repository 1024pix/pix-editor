export class SearchResult {
  #title;

  constructor({ type, id, status, title, locale, isPrimary, version }) {
    this.type = type;
    this.status = status;
    this.#title = title;
    this.locale = locale;
    this.id = id;
    this.isPrimary = isPrimary;
    this.version = version;
  }

  get title() {
    if (this.#title.length > 100) return this.#title.slice(0, 100).trim() + '…';
    return this.#title;
  }
}
