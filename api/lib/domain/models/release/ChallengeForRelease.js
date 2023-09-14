export class ChallengeForRelease {
  constructor({
    id,
    instruction,
    alternativeInstruction,
    proposals,
    type,
    solution,
    solutionToDisplay,
    t1Status,
    t2Status,
    t3Status,
    status,
    skillId,
    timer,
    competenceId,
    embedUrl,
    embedTitle,
    embedHeight,
    format,
    autoReply,
    locales,
    focusable,
    delta,
    alpha,
    responsive,
    genealogy,
    attachments,
    illustrationAlt,
    illustrationUrl,
    shuffled,
    alternativeVersion
  }) {
    this.id = id;
    this.instruction = instruction;
    this.proposals = proposals;
    this.type = type;
    this.solution = solution;
    this.solutionToDisplay = solutionToDisplay;
    this.t1Status = t1Status;
    this.t2Status = t2Status;
    this.t3Status = t3Status;
    this.status = status;
    this.skillId = skillId;
    this.embedUrl = embedUrl;
    this.embedTitle = embedTitle;
    this.embedHeight = embedHeight;
    this.timer = timer;
    this.competenceId = competenceId;
    this.format = format;
    this.autoReply = autoReply;
    this.locales = locales;
    this.alternativeInstruction = alternativeInstruction;
    this.focusable = focusable;
    this.genealogy = genealogy;
    this.responsive = responsive;
    this.delta = delta;
    this.alpha = alpha;
    this.attachments = attachments;
    this.illustrationAlt = illustrationAlt;
    this.illustrationUrl = illustrationUrl;
    this.shuffled = shuffled;
    this.alternativeVersion = alternativeVersion;
  }
}
