export class CrawledUrl {
  constructor({ statusCode, url, errorMessage }) {
    this.statusCode = statusCode;
    this.url = url;
    this.errorMessage = errorMessage;
  }
}
