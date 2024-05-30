export class Attachment {
  constructor({
    id,
    url,
    type,
    alt,
    challengeId,
    localizedChallengeId,
  }) {
    this.id = id;
    this.url = url;
    this.type = type;
    this.alt = alt;
    this.challengeId = challengeId;
    this.localizedChallengeId = localizedChallengeId;
  }

  clone({ challengeId, localizedChallengeId }) {
    return new Attachment({
      id: null,
      url: this.url,
      type: this.type,
      alt: this.alt,
      challengeId,
      localizedChallengeId,
    });
  }
}
