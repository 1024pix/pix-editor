export class CrawledUrl {
  constructor({ statusCode, url, errorMessage }) {
    this.statusCode = statusCode;
    this.url = url;
    this.errorMessage = errorMessage;
  }

  get isRepaired() {
    return this.statusCode < 400;
  }

  get isBroken() {
    return this.statusCode >= 400;
  }
}
