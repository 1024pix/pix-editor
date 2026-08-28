export class BrokenUrl {
  constructor({ id, statusCode, errorMessage, url, challenges = [], tutorials = [] }) {
    this.id = id;
    this.statusCode = statusCode;
    this.errorMessage = errorMessage;
    this.url = url;
    this.challenges = challenges;
    this.tutorials = tutorials;
  }
}
