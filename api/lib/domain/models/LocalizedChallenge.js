import { Challenge } from './Challenge.js';

export class LocalizedChallenge {
  #primaryEmbedUrl;

  constructor({
    id,
    challengeId,
    embedUrl,
    primaryEmbedUrl,
    fileIds,
    locale,
    status,
    geography,
    urlsToConsult,
    requireGafamWebsiteAccess,
    isIncompatibleIpadCertif,
    deafAndHardOfHearing,
    isAwarenessChallenge,
    toRephrase,
    hasEmbedInternalValidation,
    noValidationNeeded,
    validatedAt,
    instruction,
    alternativeInstruction,
    proposals,
    solution,
    solutionToDisplay,
    embedTitle,
    illustrationAlt,
  } = {}) {
    this.id = id;
    this.challengeId = challengeId;
    this.embedUrl = embedUrl;
    this.#primaryEmbedUrl = primaryEmbedUrl;
    this.fileIds = fileIds ?? [];
    this.locale = locale;
    this.status = status;
    this.geography = geography;
    this.urlsToConsult = urlsToConsult;
    this.requireGafamWebsiteAccess = requireGafamWebsiteAccess;
    this.isIncompatibleIpadCertif = isIncompatibleIpadCertif;
    this.deafAndHardOfHearing = deafAndHardOfHearing;
    this.isAwarenessChallenge = isAwarenessChallenge;
    this.toRephrase = toRephrase;
    this.hasEmbedInternalValidation = hasEmbedInternalValidation;
    this.noValidationNeeded = noValidationNeeded;
    this.validatedAt = validatedAt;

    this.instruction = instruction;
    this.alternativeInstruction = alternativeInstruction;
    this.proposals = proposals;
    this.solution = solution;
    this.solutionToDisplay = solutionToDisplay;
    this.embedTitle = embedTitle;
    this.illustrationAlt = illustrationAlt;
  }

  static get STATUSES() {
    return {
      PLAY: Challenge.STATUSES.VALIDE,
      PAUSE: Challenge.STATUSES.PROPOSE,
      PRIMARY: null,
    };
  }

  static get DEAF_AND_HARD_OF_HEARING_VALUES() {
    return {
      OK: 'OK',
      KO: 'KO',
      RAS: 'RAS',
      ACQUIS_NON_PERTINENT: 'Acquis Non Pertinent',
    };
  }

  static get SUPPORTED_LOCALES() {
    return SUPPORTED_LOCALES;
  }

  get isPrimary() {
    return this.id === this.challengeId;
  }

  get defaultEmbedUrl() {
    if (!this.#primaryEmbedUrl) return null;
    if (!URL.canParse(this.#primaryEmbedUrl)) return null;

    const url = new URL(this.#primaryEmbedUrl);
    if (hasLocaleInFirstPathSegment(url)) {
      url.pathname = url.pathname.split('/').with(1, this.locale).join('/');
    } else {
      url.searchParams.set('lang', this.locale);
    }

    return url.href;
  }

  static buildPrimary({
    challengeId,
    locale,
    embedUrl,
    geography,
    urlsToConsult,
    requireGafamWebsiteAccess,
    isIncompatibleIpadCertif,
    deafAndHardOfHearing,
    isAwarenessChallenge,
    toRephrase,
    hasEmbedInternalValidation,
    noValidationNeeded,
    instruction,
    alternativeInstruction,
    proposals,
    solution,
    solutionToDisplay,
    embedTitle,
    illustrationAlt,
  }) {
    return new LocalizedChallenge({
      id: challengeId,
      challengeId,
      locale,
      embedUrl,
      geography,
      urlsToConsult,
      status: LocalizedChallenge.STATUSES.PRIMARY,
      fileIds: [],
      requireGafamWebsiteAccess: requireGafamWebsiteAccess ?? false,
      isIncompatibleIpadCertif: isIncompatibleIpadCertif ?? false,
      deafAndHardOfHearing: deafAndHardOfHearing ?? LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.RAS,
      isAwarenessChallenge: isAwarenessChallenge ?? false,
      toRephrase: toRephrase ?? false,
      hasEmbedInternalValidation: hasEmbedInternalValidation ?? false,
      noValidationNeeded: noValidationNeeded ?? false,
      validatedAt: null,
      instruction,
      alternativeInstruction,
      proposals,
      solution,
      solutionToDisplay,
      embedTitle,
      illustrationAlt,
    });
  }

  static buildAlternativeFromTranslation(translation) {
    return new LocalizedChallenge({
      id: null,
      challengeId: translation.entityId,
      locale: translation.locale,
      status: LocalizedChallenge.STATUSES.PAUSE,
      embedUrl: null,
      fileIds: [],
      geography: 'AA',
      urlsToConsult: null,
      requireGafamWebsiteAccess: false,
      isIncompatibleIpadCertif: false,
      deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.RAS,
      isAwarenessChallenge: false,
      toRephrase: false,
      hasEmbedInternalValidation: false,
      noValidationNeeded: false,
      validatedAt: null,
    });
  }

  clone({ id, challengeId, status, attachments }) {
    const clonedAttachments = [];
    const clonedLocalizedChallenge = new LocalizedChallenge({
      id,
      challengeId,
      status,
      locale: this.locale,
      embedUrl: this.embedUrl,
      fileIds: [],
      geography: this.geography,
      urlsToConsult: this.urlsToConsult,
      requireGafamWebsiteAccess: this.requireGafamWebsiteAccess,
      isIncompatibleIpadCertif: this.isIncompatibleIpadCertif,
      deafAndHardOfHearing: this.deafAndHardOfHearing,
      isAwarenessChallenge: this.isAwarenessChallenge,
      toRephrase: this.toRephrase,
      hasEmbedInternalValidation: this.hasEmbedInternalValidation,
      noValidationNeeded: this.noValidationNeeded,
      validatedAt: null,
      alternativeInstruction: this.alternativeInstruction,
      embedTitle: this.embedTitle,
      instruction: this.instruction,
      proposals: this.proposals,
      solution: this.solution,
      solutionToDisplay: this.solutionToDisplay,
      illustrationAlt: this.illustrationAlt,
    });
    for (const attachmentId of this.fileIds) {
      const attachmentToClone = attachments.find((attachment) => attachment.id === attachmentId);
      clonedAttachments.push(attachmentToClone.clone({
        challengeId,
        localizedChallengeId: id,
      }));
    }
    return {
      clonedLocalizedChallenge,
      clonedAttachments,
    };
  }

  /**
   * @param {LocalizedChallenge|Object} updates
   */
  update(updates) {
    const oldStatus = this.status;
    if (updates.status === LocalizedChallenge.STATUSES.PLAY && updates.status !== oldStatus) {
      this.validatedAt = new Date();
    }
    this.locale = updates.locale;
    this.embedUrl = updates.embedUrl;
    this.status = updates.status;
    this.geography = updates.geography;
    this.urlsToConsult = updates.urlsToConsult;
    this.requireGafamWebsiteAccess = updates.requireGafamWebsiteAccess;
    this.isIncompatibleIpadCertif = updates.isIncompatibleIpadCertif;
    this.deafAndHardOfHearing = updates.deafAndHardOfHearing;
    this.isAwarenessChallenge = updates.isAwarenessChallenge;
    this.toRephrase = updates.toRephrase;
    this.hasEmbedInternalValidation = updates.hasEmbedInternalValidation;
    this.noValidationNeeded = updates.noValidationNeeded;
  }
}

function hasLocaleInFirstPathSegment(url) {
  if (url.searchParams.has('lang')) return false;
  return isSupportedLocale(url.pathname.split('/')[1]);
}

function isSupportedLocale(s) {
  return SUPPORTED_LOCALES.includes(s);
}

const SUPPORTED_LOCALES = ['en', 'es', 'es-419', 'fr', 'fr-BE', 'fr-FR', 'nl-BE', 'nl'];
