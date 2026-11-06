export class TubeForReplication {
  constructor({ id, name, practicalTitle_i18n, practicalDescription_i18n, thematicId, competenceId }) {
    this.id = id;
    this.name = name;
    this.practicalTitle_i18n = practicalTitle_i18n;
    this.practicalDescription_i18n = practicalDescription_i18n;
    this.thematicId = thematicId;
    this.competenceId = competenceId;

    // mappings for replication
    this.practicalTitle = practicalTitle_i18n.fr;
    this.practicalDescription = practicalDescription_i18n.fr;
  }
}
