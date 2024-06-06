import { getCountryCode, getCountryName } from './Geography.js';
import { LocalizedChallenge } from './LocalizedChallenge.js';
import _ from 'lodash';

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

  static get STATUSES() {
    return {
      VALIDE: 'validé',
      PROPOSE: 'proposé',
      ARCHIVE: 'archivé',
      PERIME: 'périmé',
    };
  }

  static get ID_PREFIX() {
    return 'challenge';
  }

  get isPropose() {
    return this.status === Challenge.STATUSES.PROPOSE;
  }

  get isValide() {
    return this.status === Challenge.STATUSES.VALIDE;
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

  get #primaryLocalizedChallenge() {
    return this.localizedChallenges.find(({ locale }) => locale === this.primaryLocale);
  }

  get #primaryEmbedUrl() {
    return this.#primaryLocalizedChallenge.embedUrl;
  }

  get #primaryUrlsToConsult() {
    return this.#primaryLocalizedChallenge.urlsToConsult;
  }

  get translations() {
    return JSON.parse(JSON.stringify(this.#translations));
  }

  static getPrimaryLocale(locales) {
    return Challenge.defaultLocales(locales)[0];
  }

  static defaultLocales(locales) {
    if (locales == undefined || locales.length === 0) return ['fr'];
    return [...locales].sort();
  }

  cloneChallengeAndAttachments({ competenceId, skillId, generateNewIdFnc, alternativeVersion, prototypeVersion, attachments }) {
    const id = generateNewIdFnc(Challenge.ID_PREFIX);
    const clonedAttachments = [];
    const clonedLocalizedChallenges = [];
    for (const localizedChallenge of this.localizedChallenges) {
      let newLocalizedChallengeId, status;
      if (localizedChallenge.id === localizedChallenge.challengeId) {
        newLocalizedChallengeId = id;
        status = null;
      } else {
        newLocalizedChallengeId = generateNewIdFnc(Challenge.ID_PREFIX);
        status = Challenge.STATUSES.PROPOSE;
      }
      clonedLocalizedChallenges.push(new LocalizedChallenge({
        id: newLocalizedChallengeId,
        challengeId: id,
        status,
        locale: localizedChallenge.locale,
        embedUrl: localizedChallenge.embedUrl,
        fileIds: [],
        geography: localizedChallenge.geography,
        urlsToConsult: localizedChallenge.urlsToConsult,
      }));
      for (const attachmentId of localizedChallenge.fileIds) {
        const attachmentToClone = attachments.find((attachment) => attachment.id === attachmentId);
        clonedAttachments.push(attachmentToClone.clone({
          challengeId: id,
          localizedChallengeId: newLocalizedChallengeId,
        }));
      }
    }

    const clonedChallenge =  new Challenge({
      id,
      airtableId: null,
      translations: _.cloneDeep(this.#translations),
      localizedChallenges: clonedLocalizedChallenges,
      locales: this.locales,
      files: [],
      accessibility1: this.accessibility1,
      accessibility2: this.accessibility2,
      alternativeVersion,
      alpha: null,
      archivedAt: null,
      author: this.author,
      autoReply: this.autoReply,
      competenceId: competenceId,
      contextualizedFields : this.contextualizedFields,
      createdAt: null,
      declinable: this.declinable,
      delta: null,
      embedHeight: this.embedHeight,
      focusable: this.focusable,
      format: this.format,
      genealogy: this.genealogy,
      geography: this.geography,
      madeObsoleteAt: null,
      pedagogy: this.pedagogy,
      responsive: this.responsive,
      shuffled: this.shuffled,
      skillId,
      skills: [],
      spoil: this.spoil,
      status: Challenge.STATUSES.PROPOSE,
      t1Status: this.t1Status,
      t2Status: this.t2Status,
      t3Status: this.t3Status,
      timer: this.timer,
      type: this.type,
      updatedAt: null,
      validatedAt: null,
      version: prototypeVersion,
    });

    return {
      clonedChallenge,
      clonedAttachments,
    };
  }

  archive() {
    const now = new Date();
    if (this.isPropose) {
      this.status = Challenge.STATUSES.PERIME;
      this.madeObsoleteAt = now;
      return;
    }
    if (this.isValide) {
      this.status = Challenge.STATUSES.ARCHIVE;
      this.archivedAt = now;
    }
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

    const localizedChallenge = findCorrespondingLocalizedChallenge(this.localizedChallenges, this.locale);

    this.id = localizedChallenge.id;
    this.status = this.#translateStatus(localizedChallenge);
    this.embedUrl = this.#translateEmbedUrl(localizedChallenge);
    this.geography = getCountryName(localizedChallenge.geography);
    this.urlsToConsult = this.#translateUrlsToConsult(localizedChallenge);

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

  #translateUrlsToConsult(localizedChallenge) {
    if (!this.#primaryUrlsToConsult) return null;
    return localizedChallenge.urlsToConsult;
  }
}

function findCorrespondingLocalizedChallenge(localizedChallenges, challengeLocale) {
  return localizedChallenges.find(({ locale }) => challengeLocale === locale);
}
