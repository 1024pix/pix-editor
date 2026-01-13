export class SearchResult {
  constructor({ type, id, status, title, locale = null, isPrimary }) {
    this.type = type;
    this.status = status;
    this.title = title;
    this.locale = locale;
    this.id = id;
    this.isPrimary = isPrimary;
  }
}
