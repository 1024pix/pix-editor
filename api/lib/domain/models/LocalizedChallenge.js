export class LocalizedChallenge {
  constructor({
    id,
    challengeId,
    locale,
    embedUrl,
    status,
  } = {}) {
    this.id = id;
    this.challengeId = challengeId;
    this.locale = locale;
    this.embedUrl = embedUrl;
    this.status = status;
  }
}
