export class ThematicForReplication {
  constructor({ id, name_i18n, competenceId, tubeIds }) {
    this.id = id;
    this.name_i18n = name_i18n;
    this.competenceId = competenceId;
    this.tubeIds = tubeIds;

    // mappings for replication
    this.index = id;
    this.name = name_i18n?.fr;
  }
}
