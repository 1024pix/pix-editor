class MissionSummary {
  constructor({
    id,
    name,
    competence,
    createdAt,
    status,
  }) {
    this.id = id;
    this.name = name;
    this.competence = competence;
    this.createdAt = createdAt;
    this.status = status;
  }
}

export { MissionSummary };
