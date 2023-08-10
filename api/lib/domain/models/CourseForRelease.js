module.exports = class CourseForRelease {
  constructor({
    id,
    name,
    description,
    isActive,
    competences,
    challenges,
    imageUrl,
  }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.isActive = isActive;
    this.competences = competences;
    this.challenges = challenges;
    this.imageUrl = imageUrl;
  }
};
