export class LocalizedChallenge {
  constructor({
    id,
    challengeId,
    locale,
    embedUrl,
  } = {}) {
    this.id = id;
    this.challengeId = challengeId;
    this.locale = locale;
    this.embedUrl = embedUrl;
  }
}
