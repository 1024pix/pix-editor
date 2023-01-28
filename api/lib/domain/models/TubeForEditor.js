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
    if (currentActiveSkillForLevel && currentActiveSkillForLevel?.id !== skill.id) currentActiveSkillForLevel.archive();
  }

  findCurrentActiveSkillForLevel(level) {
    return this._skills.find((skill) => skill.level === level && skill.isActive);
  }

  findChallenge(challengeId) {
    for (const skill of this._skills) {
      const challenge = skill.findChallenge(challengeId);
      if (challenge) return challenge;
    }
    return null;
  }

  toDTO() {
    return {
      id: this._id,
      skills: this._skills.map((skill) => skill.toDTO()),
    };
  }
};
