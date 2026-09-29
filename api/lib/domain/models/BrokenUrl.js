export class BrokenUrl {
  constructor({ id, errorMessage, statusCode, url, ignored }) {
    this.id = id;
    this.errorMessage = errorMessage;
    this.statusCode = statusCode;
    this.url = url;
    this.ignored = ignored;
  }

  update({ ignored }) {
    this.ignored = ignored;
  }
}
