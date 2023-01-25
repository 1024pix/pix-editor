module.exports = class TubeForEditor {
  constructor({
    id,
    skills,
  }) {
    this._id = id;
    this._skills = skills;
  }

  validateChallenge(challengeId, alternativeIdsToValidate) {
    const skill = this._skills.find((skill) => skill.hasChallenge(challengeId));
    const currentActiveSkillForLevel = this.findCurrentActiveSkillForLevel(skill.level);
    skill.validateChallenge(challengeId, alternativeIdsToValidate);
    if (currentActiveSkillForLevel.id !== skill.id) currentActiveSkillForLevel.archive();
  }

  findCurrentActiveSkillForLevel(level) {
    return this._skills.find((skill) => skill.level === level && skill.isActive);
  }

  toDTO() {
    return {
      id: this._id,
      skills: this._skills.map((skill) => skill.toDTO()),
    };
  }
};
