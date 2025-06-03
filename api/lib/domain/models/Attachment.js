export class Attachment {
  constructor({
    id,
    filename,
    url,
    type,
    size,
    mimeType,
    challengeId,
    airtableChallengeId,
    localizedChallengeId,
  }) {
    this.id = id;
    this.url = url;
    this.type = type;
    this.size = size;
    this.mimeType = mimeType;
    this.filename = filename;
    this.challengeId = challengeId;
    this.airtableChallengeId = airtableChallengeId;
    this.localizedChallengeId = localizedChallengeId;
  }

  static get TYPES() {
    return {
      ATTACHMENT: 'attachment',
      ILLUSTRATION: 'illustration',
    };
  }

  update(updateCommand) {
    this.filename = updateCommand.filename;
  }

  clone({ challengeId, localizedChallengeId }) {
    return new Attachment({
      id: null,
      url: this.url,
      type: this.type,
      size: this.size,
      mimeType: this.mimeType,
      filename: this.filename,
      airtableChallengeId: null,
      challengeId,
      localizedChallengeId,
    });
  }
}
