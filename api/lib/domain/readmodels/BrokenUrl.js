export class BrokenUrl {
  constructor({ id, errorMessage, statusCode, url, localizedChallengeIds = [], skillIds = [], tutorialIds = [] }) {
    this.id = id;
    this.errorMessage = errorMessage;
    this.statusCode = statusCode;
    this.url = url;
    this.localizedChallengeIds = localizedChallengeIds;
    this.skillIds = skillIds;
    this.tutorialIds = tutorialIds;
  }
}
