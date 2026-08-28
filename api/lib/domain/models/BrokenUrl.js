export class BrokenUrl {
  constructor({ id, statusCode, url, errorMessage }) {
    this.id = id;
    this.statusCode = statusCode;
    this.url = url;
    this.errorMessage = errorMessage;
  }
}
