export class Mission {
  constructor({
    id,
    name_i18n,
    competenceId,
    thematicId,
    createdAt,
    learningObjectives_i18n,
    validatedObjectives_i18n,
    status,
    content,
  }) {
    this.id = id;
    this.name_i18n = name_i18n;
    this.competenceId = competenceId;
    this.thematicId = thematicId;
    this.createdAt = createdAt;
    this.learningObjectives_i18n = learningObjectives_i18n;
    this.validatedObjectives_i18n = validatedObjectives_i18n;
    this.status = status;
    this.content = new Content(content);
  }
}

const status = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};

Mission.status = status;

class Content {
  constructor({
    steps = [new Step()],
    dareChallenges = [],
  } = {}) {
    this.steps = steps.map((step) => new Step(step));
    this.dareChallenges = dareChallenges;
    // for retro compatibility we keep former format (ie. without any step)
    this.tutorialChallenges = steps[0].tutorialChallenges;
    this.trainingChallenges = steps[0].trainingChallenges;
    this.validationChallenges = steps[0].validationChallenges;
  }
}

class Step {
  constructor({
    tutorialChallenges = [],
    trainingChallenges = [],
    validationChallenges = [],
  } = {}) {
    this.tutorialChallenges = tutorialChallenges;
    this.trainingChallenges = trainingChallenges;
    this.validationChallenges = validationChallenges;
  }
}

