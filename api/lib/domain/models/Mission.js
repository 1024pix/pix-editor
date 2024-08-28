export class Mission {
  constructor({
    id,
    name_i18n,
    competenceId,
    thematicIds,
    createdAt,
    learningObjectives_i18n,
    validatedObjectives_i18n,
    introductionMediaUrl,
    introductionMediaType,
    introductionMediaAlt,
    status,
    documentationUrl,
  }) {
    this.id = id;
    this.name_i18n = name_i18n;
    this.competenceId = competenceId;
    this.thematicIds = thematicIds;
    this.createdAt = createdAt;
    this.learningObjectives_i18n = learningObjectives_i18n;
    this.validatedObjectives_i18n = validatedObjectives_i18n;
    this.introductionMediaUrl = introductionMediaUrl;
    this.introductionMediaType = introductionMediaType;
    this.introductionMediaAlt = introductionMediaAlt;
    this.status = status;
    this.documentationUrl = documentationUrl;
  }
}

const status = {
  VALIDATED: 'VALIDATED',
  EXPERIMENTAL: 'EXPERIMENTAL',
  INACTIVE: 'INACTIVE',
};

Mission.status = status;
