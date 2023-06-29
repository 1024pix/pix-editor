module.exports = class StaticCourseSummary {
  constructor({
    id,
    name,
    challengeCount,
    createdAt,
  }) {
    this.id = id;
    this.name = name;
    this.challengeCount = challengeCount;
    this.createdAt = createdAt;
  }
};
