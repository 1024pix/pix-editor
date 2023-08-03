module.exports = class StaticCourse {
  constructor({
    id,
    name,
    description,
    challengeSummaries,
    isActive,
    createdAt,
    updatedAt,
  }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.challengeSummaries = challengeSummaries;
    this.isActive = isActive;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
};
