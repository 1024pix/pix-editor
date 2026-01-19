export class SearchResult {
  constructor({ type, id, status, title, locale, isPrimary, version }) {
    this.type = type;
    this.status = status;
    this.title = title;
    this.locale = locale;
    this.id = id;
    this.isPrimary = isPrimary;
    this.version = version;
  }
}
