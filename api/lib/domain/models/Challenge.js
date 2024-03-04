import { getCountryCode } from './Geography.js';

export class Challenge {

  #allFiles;
  #primaryLocales;
  #primaryStatus;
  #translations;

  constructor({
    accessibility1,
    accessibility2,
    airtableId,
    alternativeVersion,
    alpha,
    archivedAt,
    author,
    autoReply,
    competenceId,
    contextualizedFields,
    createdAt,
    declinable,
    delta,
    embedHeight,
    files,
    focusable,
    format,
    genealogy,
    geography,
    id,
    locales,
    localizedChallenges,
    madeObsoleteAt,
    pedagogy,
    responsive,
    shuffled,
    skillId,
    skills,
    spoil,
    status,
    t1Status,
    t2Status,
    t3Status,
    timer,
    translations,
    type,
    updatedAt,
    validatedAt,
    version,
  } = {}) {
    this.accessibility1 = accessibility1;
    this.accessibility2 = accessibility2;
    this.airtableId = airtableId;
    this.alpha = alpha;
    this.alternativeVersion = alternativeVersion;
    this.archivedAt = archivedAt;
    this.author = author;
    this.autoReply = autoReply;
    this.competenceId = competenceId;
    this.contextualizedFields = contextualizedFields;
    this.createdAt = createdAt;
    this.declinable = declinable;
    this.delta = delta;
    this.embedHeight = embedHeight;
    this.focusable = focusable;
    this.format = format;
    this.genealogy = genealogy;
    this.geography = geography;
    this.id = id;
    this.madeObsoleteAt = madeObsoleteAt;
    this.pedagogy = pedagogy;
    this.responsive = responsive;
    this.shuffled = shuffled;
    this.skillId = skillId;
    this.skills = skills;
    this.spoil = spoil;
    this.t1Status = t1Status;
    this.t2Status = t2Status;
    this.t3Status = t3Status;
    this.timer = timer;
    this.type = type;
    this.updatedAt = updatedAt;
    this.validatedAt = validatedAt;
    this.version = version;

    this.localizedChallenges = localizedChallenges;

    this.#allFiles = files;
    this.#primaryLocales = Challenge.defaultLocales(locales);
    this.#primaryStatus = status;
    this.#translations = translations;

    this.#translate(this.primaryLocale);
  }

  translate(locale) {
    const challenge = new Challenge({
      ...this,
      files: this.#allFiles,
      locales: this.#primaryLocales,
      status: this.#primaryStatus,
      translations: this.#translations,
    });
    challenge.#translate(locale);
    return challenge;
  }

  #translate(locale) {
    this.locales = locale === this.primaryLocale
      ? this.#primaryLocales
      : [locale];

    this.instruction = this.#translations[this.locale]?.instruction ?? '';
    this.alternativeInstruction = this.#translations[this.locale]?.alternativeInstruction ?? '';
    this.proposals = this.#translations[this.locale]?.proposals ?? '';
    this.solution = this.#translations[this.locale]?.solution ?? '';
    this.solutionToDisplay = this.#translations[this.locale]?.solutionToDisplay ?? '';
    this.embedTitle = this.#translations[this.locale]?.embedTitle ?? '';
    this.illustrationAlt = this.#translations[this.locale]?.illustrationAlt ?? null;

    const localizedChallenge = this.localizedChallenges.find(({ locale }) => this.locale === locale);

    this.id = localizedChallenge.id;
    this.status = this.#translateStatus(localizedChallenge);
    this.embedUrl = this.#translateEmbedUrl(localizedChallenge);

    this.files = this.#allFiles
      ?.filter(({ localizedChallengeId }) => localizedChallengeId === this.id)
      .map(({ fileId }) => fileId);
  }

  #translateStatus(localizedChallenge) {
    if (this.isPrimary) return this.#primaryStatus;
    if (['proposé', 'périmé'].includes(this.status) || localizedChallenge.status === 'validé') {
      return this.status;
    }
    return localizedChallenge.status;
  }

  #translateEmbedUrl(localizedChallenge) {
    if (!this.#primaryEmbedUrl) return null;
    if (localizedChallenge.embedUrl) return localizedChallenge.embedUrl;
    const url = new URL(this.#primaryEmbedUrl);
    url.searchParams.set('lang', localizedChallenge.locale);
    return url.href;
  }

  get primaryLocale() {
    return this.#primaryLocales[0];
  }

  get alternativeLocales() {
    return this.localizedChallenges.map(({ locale }) => locale).filter((locale) => locale !== this.primaryLocale);
  }

  get locale() {
    return this.locales[0];
  }

  get isPrimary() {
    return this.locale === this.primaryLocale;
  }

  get geographyCode() {
    return getCountryCode(this.geography);
  }

  get #primaryEmbedUrl() {
    return this.localizedChallenges.find(({ locale }) => locale === this.primaryLocale).embedUrl;
  }

  static getPrimaryLocale(locales) {
    return Challenge.defaultLocales(locales)[0];
  }

  static defaultLocales(locales) {
    if (locales == undefined || locales.length === 0) return ['fr'];
    return [...locales].sort();
  }
}
