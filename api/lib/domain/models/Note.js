export class Note {
  static get STATUSES() {
    return {
      ARCHIVE: 'archive',
      EN_COURS: 'en cours',
      TERMINE: 'terminé',
    };
  }

  constructor({ id, status, text, author, createdAt, challengeId }) {
    this.id = id;
    this.status = status;
    this.text = text;
    this.author = author;
    this.createdAt = createdAt;
    this.challengeId = challengeId;
  }
}
