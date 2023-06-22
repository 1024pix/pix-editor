module.exports = class StaticCourse {
  constructor({
    id,
    name,
    challengeIds,
    createdAt,
  }) {
    this.id = id;
    this.createdAt = createdAt;
    this.name = name;
    this.challengeIds = challengeIds;
  }

  challengeCount() {
    return this.challengeIds.length;
  }
};
