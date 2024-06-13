export class Attachment {
  constructor({
    id,
    filename,
    url,
    type,
    alt,
    size,
    mimeType,
    challengeId,
    localizedChallengeId,
  }) {
    this.id = id;
    this.url = url;
    this.type = type;
    this.alt = alt;
    this.size = size;
    this.mimeType = mimeType;
    this.filename = filename;
    this.challengeId = challengeId;
    this.localizedChallengeId = localizedChallengeId;
  }

  clone({ challengeId, localizedChallengeId }) {
    return new Attachment({
      id: null,
      url: this.url,
      type: this.type,
      alt: this.alt,
      size: this.size,
      mimeType: this.mimeType,
      filename: this.filename,
      challengeId,
      localizedChallengeId,
    });
  }
}
