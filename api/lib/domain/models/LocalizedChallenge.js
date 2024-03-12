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

  static buildPrimary({
    challengeId,
    locale,
    embedUrl,
    geography,
  }) {
    return new LocalizedChallenge({
      id: challengeId,
      challengeId,
      locale,
      embedUrl,
      geography,
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
