export class Challenge {
  constructor({
    id,
    type,
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
    focusable,
    airtableId,
    genealogy,
    pedagogy,
    author,
    declinable,
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
    translations,
    localizedChallenges,
  } = {}) {
    this.id = id;
    this.type = type;
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
    this.locales = Challenge.defaultLocales(locales);
    this.focusable = focusable;
    this.airtableId = airtableId;
    this.genealogy = genealogy;
    this.pedagogy = pedagogy;
    this.author = author;
    this.declinable = declinable;
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
    this.translations = translations;

    this.instruction = this.translations[this.locales[0]]?.instruction ?? '';
    this.alternativeInstruction = this.translations[this.locales[0]]?.alternativeInstruction ?? '';
    this.proposals = this.translations[this.locales[0]]?.proposals ?? '';
    this.solution = this.translations[this.locales[0]]?.solution ?? '';
    this.solutionToDisplay = this.translations[this.locales[0]]?.solutionToDisplay ?? '';
    this.localizedChallenges = localizedChallenges ?? [];
  }

  static defaultLocales(locales) {
    if (locales == undefined || locales.length === 0) return ['fr'];
    return [...locales].sort();
  }

  static getPrimaryLocale(locales) {
    return Challenge.defaultLocales(locales)[0];
  }

  get primaryLocale() {
    return this.locales[0];
  }

  get alternativeLocales() {
    return this.localizedChallenges.map(({ locale }) => locale).filter((locale) => locale !== this.primaryLocale);
  }
}
