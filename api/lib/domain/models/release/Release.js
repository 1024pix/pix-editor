export class Release {
  constructor({
    id,
    content,
    createdAt,
  } = {}) {
    this.id = id;
    this.createdAt = createdAt;
    this.content = content;
  }

  get operativeChallenges() {
    return this.content.challenges.filter((c) => c.isOperative);
  }
}
