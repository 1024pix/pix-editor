export class LocalizedChallenge {
  constructor({
    id,
    challengeId,
    embedUrl,
    fileIds,
    locale,
    status,
    // FIXME This is a geography code (not a country name !)
    // remove me when all doubt is lifted (because in model challenge, geography references a country name !)
    geography,
  } = {}) {
    this.id = id;
    this.challengeId = challengeId;
    this.embedUrl = embedUrl;
    this.fileIds = fileIds ?? [];
    this.locale = locale;
    this.status = status;
    this.geography = geography;
  }

  get isPrimary() {
    return this.id === this.challengeId;
  }

  static buildPrimary(challenge) {
    return new LocalizedChallenge({
      id: challenge.id,
      challengeId: challenge.id,
      locale: challenge.primaryLocale,
      embedUrl: challenge.embedUrl,
      geography: challenge.geographyCode,
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
    });
  }
}
