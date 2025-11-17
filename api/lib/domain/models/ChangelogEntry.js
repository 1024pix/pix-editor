export class ChangelogEntry {
  static get ACTIONS() {
    return {
      AJOUT: 'ajout',
      ARCHIVAGE: 'archivage',
      DEPLACEMENT: 'déplacement',
      MODIFICATION: 'modification',
      SUPPRESSION: 'suppression',
    };
  }

  static get STATUSES() {
    return {
      ARCHIVE: 'archive',
      EN_COURS: 'en cours',
      TERMINE: 'terminé',
    };
  }

  static get ELEMENT_TYPES() {
    return {
      EPREUVE: 'épreuve',
      ACQUIS: 'acquis',
    };
  }

  constructor({ id, status, text, author, createdAt, elementId, elementType }) {
    this.id = id;
    this.status = status;
    this.text = text;
    this.author = author;
    this.createdAt = createdAt;
    this.elementId = elementId;
    this.elementType = elementType;
  }
}
