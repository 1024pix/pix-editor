module.exports = class Release {
  constructor({
    id,
    content,
    createdAt,
  } = {}) {
    this.id = id;
    this.createdAt = createdAt;
    this.content = content;
  }
};
