export class StaticCourse {
  constructor({
    id,
    name,
    description,
    challengeSummaries,
    isActive,
    deactivationReason,
    createdAt,
    updatedAt,
    tags,
  }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.challengeSummaries = challengeSummaries;
    this.isActive = isActive;
    this.deactivationReason = deactivationReason;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.tags = tags;
  }
}
