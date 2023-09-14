export class User {
  constructor({
    id,
    name,
    trigram,
    apiKey,
    access,
    createdAt,
    updatedAt,
  } = {}) {
    this.id = id;
    this.name = name;
    this.trigram = trigram;
    this.apiKey = apiKey;
    this.access = access;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
