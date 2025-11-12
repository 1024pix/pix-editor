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
}
