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
  }

  static get STATUSES() {
    return {
      PLAY: Challenge.STATUSES.VALIDE,
      PAUSE: Challenge.STATUSES.PROPOSE,
    };
  }

  get isPrimary() {
    return this.id === this.challengeId;
  }

  get defaultEmbedUrl() {
    if (!this.#primaryEmbedUrl) return null;
    const url = new URL(this.#primaryEmbedUrl);
    url.searchParams.set('lang', this.locale);
    return url.href;
  }

  static buildPrimary({
    challengeId,
    locale,
    embedUrl,
    geography,
    urlsToConsult,
  }) {
    return new LocalizedChallenge({
      id: challengeId,
      challengeId,
      locale,
      embedUrl,
      geography,
      urlsToConsult,
      status: null,
      fileIds: [],
    });
  }

  static buildAlternativeFromTranslation(translation) {
    return new LocalizedChallenge({
      id: null,
      challengeId: translation.entityId,
      locale: translation.locale,
      status: 'proposé',
      embedUrl: null,
      fileIds: [],
      geography: null,
      urlsToConsult: null,
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
