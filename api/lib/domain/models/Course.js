module.exports = class Course {
  constructor({
    id,
    name,
    description,
    competences,
    challenges,
    imageUrl,
  } = {}) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.competences = competences;
    this.challenges = challenges;
    this.imageUrl = imageUrl;
  }
};
