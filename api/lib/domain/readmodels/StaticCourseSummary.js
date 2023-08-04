module.exports = class StaticCourseSummary {
  constructor({
    id,
    name,
    challengeCount,
    isActive,
    createdAt,
  }) {
    this.id = id;
    this.name = name;
    this.challengeCount = challengeCount;
    this.isActive = isActive;
    this.createdAt = createdAt;
  }
};
