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
    // FIXME This is a geography code (not a country name !)
    // remove me when all doubt is lifted (because in model challenge, geography references a country name !)
    geography,
    urlsToConsult,
    requireGafamWebsiteAccess,
    isIncompatibleIpadCertif,
    deafAndHardOfHearing,
    isAwarenessChallenge,
    toRephrase,

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
    };
  }

  get isPrimary() {
    return this.id === this.challengeId;
  }

  get defaultEmbedUrl() {
    if (!this.#primaryEmbedUrl) return null;

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
      geography: null,
      urlsToConsult: null,
      requireGafamWebsiteAccess: false,
      isIncompatibleIpadCertif: false,
      deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.RAS,
      isAwarenessChallenge: false,
      toRephrase: false,
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
}

function hasLocaleInFirstPathSegment(url) {
  if (url.searchParams.has('lang')) return false;
  return isSupportedLocale(url.pathname.split('/')[1]);
}

function isSupportedLocale(s) {
  return SUPPORTED_LOCALES.includes(s);
}

const SUPPORTED_LOCALES = ['en', 'es', 'fr', 'fr-BE', 'fr-FR', 'nl-BE', 'nl'];
