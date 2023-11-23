export class LocalizedChallenge {
  constructor({
    id,
    challengeId,
    locale,
  } = {}) {
    this.id = id;
    this.challengeId = challengeId;
    this.locale = locale;
  }
}
