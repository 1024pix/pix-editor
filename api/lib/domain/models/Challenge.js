export class Challenge {
  constructor({
    id,
    instruction = '',
    proposals = '',
    type,
    solution = '',
    solutionToDisplay = '',
    t1Status,
    t2Status,
    t3Status,
    status,
    skills,
    embedUrl,
    embedTitle,
    embedHeight,
    timer,
    competenceId,
    format,
    files,
    autoReply,
    locales,
    alternativeInstruction = '',
    focusable,
    airtableId,
    genealogy,
    pedagogy,
    author,
    declinable,
    preview,
    version,
    alternativeVersion,
    accessibility1,
    accessibility2,
    spoil,
    responsive,
    area,
    updatedAt,
    validatedAt,
    archivedAt,
    madeObsoleteAt,
    createdAt,
    shuffled,
    contextualizedFields,
    alpha,
    delta,
    skillId,
  } = {}) {
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
    this.skills = skills;
    this.embedUrl = embedUrl;
    this.embedTitle = embedTitle;
    this.embedHeight = embedHeight;
    this.timer = timer;
    this.competenceId = competenceId;
    this.format = format;
    this.files = files;
    this.autoReply = autoReply;
    this.locales = locales?.length === 0 ? ['fr'] : locales;
    this.alternativeInstruction = alternativeInstruction;
    this.focusable = focusable;
    this.airtableId = airtableId;
    this.genealogy = genealogy;
    this.pedagogy = pedagogy;
    this.author = author;
    this.declinable = declinable;
    this.preview = preview;
    this.version = version;
    this.alternativeVersion = alternativeVersion;
    this.accessibility1 = accessibility1;
    this.accessibility2 = accessibility2;
    this.spoil = spoil;
    this.responsive = responsive;
    this.area = area;
    this.updatedAt = updatedAt;
    this.validatedAt = validatedAt;
    this.archivedAt = archivedAt;
    this.madeObsoleteAt = madeObsoleteAt;
    this.createdAt = createdAt;
    this.shuffled = shuffled;
    this.contextualizedFields = contextualizedFields;
    this.alpha = alpha;
    this.delta = delta;
    this.skillId = skillId;
  }
}
