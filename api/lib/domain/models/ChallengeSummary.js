module.exports = class ChallengeSummary {
  constructor({
    id,
    instruction,
    skillName,
    status,
    index,
  }) {
    this.id = id;
    this.instruction = instruction;
    this.skillName = skillName;
    this.status = status;
    this.index = index;
  }
};