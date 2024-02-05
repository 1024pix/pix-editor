export class LocalizedChallenge {
  constructor({
    id,
    challengeId,
    embedUrl,
    fileIds,
    locale,
    status,
  } = {}) {
    this.id = id;
    this.challengeId = challengeId;
    this.embedUrl = embedUrl;
    this.fileIds = fileIds ?? [];
    this.locale = locale;
    this.status = status;
  }

  get isPrimary() {
    return this.id === this.challengeId;
  }
}
