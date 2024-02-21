export class Attachment {
  constructor({
    id,
    url,
    type,
    challengeId,
    localizedChallengeId,
  }) {
    this.id = id;
    this.url = url;
    this.type = type;
    this.challengeId = challengeId;
    this.localizedChallengeId = localizedChallengeId;
  }
}
