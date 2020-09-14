class User {
  constructor({
    id,
    // attributes
    name,
    trigram,
    apiKey,
    access,
    createdAt,
    updatedAt,
    // includes
    // references
  } = {}) {
    this.id = id;
    // attributes
    this.name = name;
    this.trigram = trigram;
    this.apiKey = apiKey;
    this.access = access;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    // includes
    // references
  }
}

module.exports = User;
