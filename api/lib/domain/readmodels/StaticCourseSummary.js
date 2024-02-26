export class StaticCourseSummary {
  constructor({
    id,
    name,
    challengeCount,
    isActive,
    createdAt,
    tags,
  }) {
    this.id = id;
    this.name = name;
    this.challengeCount = challengeCount;
    this.isActive = isActive;
    this.createdAt = createdAt;
    this.tags = tags;
  }
}
