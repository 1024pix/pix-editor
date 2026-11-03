export class MissionForReplication {
  constructor({
    id,
    name_i18n,
    cardImageUrl,
    competenceId,
    thematicIds,
    learningObjectives_i18n,
    validatedObjectives_i18n,
    introductionMediaUrl,
    introductionMediaType,
    introductionMediaAlt_i18n,
    status,
    documentationUrl,
    content,
  }) {
    this.id = id;
    this.name_i18n = name_i18n;
    this.learningObjectives_i18n = learningObjectives_i18n;
    this.validatedObjectives_i18n = validatedObjectives_i18n;
    this.introductionMediaAlt_i18n = introductionMediaAlt_i18n;
    this.cardImageUrl = cardImageUrl;
    this.competenceId = competenceId;
    this.thematicIds = thematicIds;
    this.introductionMediaUrl = introductionMediaUrl;
    this.introductionMediaType = introductionMediaType;
    this.status = status;
    this.documentationUrl = documentationUrl;
    this.content = content;

    // mappings for replication
    this.name = name_i18n?.fr;
    this.learningObjectives = learningObjectives_i18n?.fr;
    this.validatedObjectives = validatedObjectives_i18n?.fr;
    this.introductionMediaAlt = introductionMediaAlt_i18n?.fr;
  }
}
