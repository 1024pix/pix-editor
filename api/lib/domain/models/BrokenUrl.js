export class BrokenUrl {
  constructor({ statusCode, url, errorMessage }) {
    this.statusCode = statusCode;
    this.url = url;
    this.errorMessage = errorMessage;
  }
}
