module.exports = class Release {
  constructor({
    id,
    // attributes
    content,
    createdAt,
    // includes
    // references
  } = {}) {
    this.id = id;
    // attributes
    this.createdAt = createdAt;
    // includes
    this.content = content;
    // references
  }
};
