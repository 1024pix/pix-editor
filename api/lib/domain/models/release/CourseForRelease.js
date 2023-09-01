export class CourseForRelease {
  constructor({
    id,
    name,
    description,
    isActive,
    competences,
    challenges,
  }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.isActive = isActive;
    this.competences = competences;
    this.challenges = challenges;
  }
}
