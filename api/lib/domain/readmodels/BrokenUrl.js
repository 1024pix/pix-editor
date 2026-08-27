export class BrokenUrl {
  constructor({
    id,
    statusCode,
    errorMessage,
    url,
  }) {
    this.id = id;
    this.statusCode = statusCode;
    this.errorMessage = errorMessage;
    this.url = url;
  }
}
