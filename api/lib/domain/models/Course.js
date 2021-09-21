module.exports = class Course {
  constructor({
    // attributes
    id,
    name,
    description,
    competences,
    challenges,
    imageUrl,
    // includes
    // references
  } = {}) {
    // attributes
    this.id = id;
    this.name = name;
    this.description = description;
    this.competences = competences;
    this.challenges = challenges;
    this.imageUrl = imageUrl;
    // includes
    // references
  }
};
