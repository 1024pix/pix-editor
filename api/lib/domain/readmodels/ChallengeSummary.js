export class ChallengeSummary {
  constructor({
    id,
    instruction,
    skillName,
    status,
    index,
    previewUrl,
  }) {
    this.id = id;
    this.instruction = instruction;
    this.skillName = skillName;
    this.status = status;
    this.index = index;
    this.previewUrl = previewUrl;
  }
}
