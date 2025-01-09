export class LocalizedChallenge {
  constructor({
    id,
    challengeId,
    locale,
    instruction,
    status,
  }) {
    this.id = id;
    this.challengeId = challengeId;
    this.locale = locale;
    this.instruction = instruction;
    this.status = status;
  }

  static buildFromChallengeAndLocale(challenge, locale) {
    const translatedChallenge = challenge.translate(locale);
    return new LocalizedChallenge({
      id: translatedChallenge.id,
      challengeId: challenge.id,
      locale,
      instruction: translatedChallenge.instruction,
      status: translatedChallenge.status,
    });
  }
}
