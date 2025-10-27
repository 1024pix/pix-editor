export class LocalizedChallenge {
  constructor({ id, challengeId, locale, instruction, geography, status }) {
    this.id = id;
    this.challengeId = challengeId;
    this.locale = locale;
    this.geography = geography;
    this.instruction = instruction;
    this.status = status;
  }

  static buildFromChallengeAndLocale(challenge, locale) {
    const translatedChallenge = challenge.translate(locale);
    return new LocalizedChallenge({
      id: translatedChallenge.id,
      geography: translatedChallenge.geography,
      challengeId: challenge.id,
      locale,
      instruction: translatedChallenge.instruction,
      status: translatedChallenge.status,
    });
  }
}
