module.exports = class StaticCourse {
  constructor({
    id,
    name,
    description,
    challengeSummaries,
    createdAt,
    updatedAt,
  }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.challengeSummaries = challengeSummaries;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
};
