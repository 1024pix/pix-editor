export class BrokenUrl {
  constructor({ id, errorMessage, statusCode, url }) {
    this.id = id;
    this.errorMessage = errorMessage;
    this.statusCode = statusCode;
    this.url = url;
  }
}
