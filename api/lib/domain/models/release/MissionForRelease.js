export class MissionForRelease {
  constructor({
    id,
    name_i18n,
    competenceId,
    thematicId,
    learningObjectives_i18n,
    validatedObjectives_i18n,
    status,
  }) {
    this.id = id;
    this.name_i18n = name_i18n;
    this.competenceId = competenceId;
    this.thematicId = thematicId;
    this.learningObjectives_i18n = learningObjectives_i18n;
    this.validatedObjectives_i18n = validatedObjectives_i18n;
    this.status = status;
  }
}
