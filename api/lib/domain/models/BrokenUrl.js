export class BrokenUrl {
  constructor({ id, errorMessage, statusCode, url, ignored = false }) {
    this.id = id;
    this.errorMessage = errorMessage;
    this.statusCode = statusCode;
    this.url = url;
    this.ignored = ignored;
  }
}
