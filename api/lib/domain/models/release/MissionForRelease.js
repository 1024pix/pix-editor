export class MissionForRelease {
  constructor({
    id,
    name_i18n,
    competenceId,
    learningObjectives_i18n,
    validatedObjectives_i18n,
    status,
    content,
    introductionMediaUrl,
    introductionMediaType,
    introductionMediaAlt,
    documentationUrl
  }) {
    this.id = id;
    this.name_i18n = name_i18n;
    this.competenceId = competenceId;
    this.learningObjectives_i18n = learningObjectives_i18n;
    this.validatedObjectives_i18n = validatedObjectives_i18n;
    this.status = status;
    this.content = new Content(content);
    this.introductionMediaUrl = introductionMediaUrl;
    this.introductionMediaType = introductionMediaType;
    this.introductionMediaAlt = introductionMediaAlt;
    this.documentationUrl = documentationUrl;
  }
}

class Content {
  constructor({
    steps = [],
    dareChallenges = [],
  } = {}) {
    this.steps = steps.map((step) => new Step(step));
    this.dareChallenges = dareChallenges;
  }
}

class Step {
  constructor({
    name_i18n,
    tutorialChallenges = [],
    trainingChallenges = [],
    validationChallenges = [],
  } = {}) {
    this.name_i18n = name_i18n;
    this.tutorialChallenges = tutorialChallenges;
    this.trainingChallenges = trainingChallenges;
    this.validationChallenges = validationChallenges;
  }
}
