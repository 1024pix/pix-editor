export class Attachment {
  constructor({
    id,
    url,
    alt,
    type,
    challengeId,
    localizedChallengeId,
  }) {
    this.id = id;
    this.url = url;
    this.alt = alt;
    this.type = type;
    this.challengeId = challengeId;
    this.localizedChallengeId = localizedChallengeId;
  }
}
