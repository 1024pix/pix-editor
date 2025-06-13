export class TubeForReplication {
  constructor({
    id,
    name,
    practicalTitle_i18n,
    practicalDescription_i18n,
    competenceId,
    isMobileCompliant,
    isTabletCompliant,
    thematicId,
    skillIds,
  }) {
    this.id = id;
    this.name = name;
    this.practicalTitle_i18n = practicalTitle_i18n;
    this.practicalDescription_i18n = practicalDescription_i18n;
    this.competenceId = competenceId;
    this.isMobileCompliant = isMobileCompliant;
    this.isTabletCompliant = isTabletCompliant;
    this.thematicId = thematicId;
    this.skillIds = skillIds;
  }
}
