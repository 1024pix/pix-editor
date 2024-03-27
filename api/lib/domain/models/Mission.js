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
    content = {
      tutorialChallenges: [],
      trainingChallenges: [],
      validationChallenges: [],
      dareChallenges: [],
    },
  }) {
    this.id = id;
    this.name_i18n = name_i18n;
    this.competenceId = competenceId;
    this.thematicId = thematicId;
    this.createdAt = createdAt;
    this.learningObjectives_i18n = learningObjectives_i18n;
    this.validatedObjectives_i18n = validatedObjectives_i18n;
    this.status = status;
    this.content = content;
  }
}

const status = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};

Mission.status = status;
