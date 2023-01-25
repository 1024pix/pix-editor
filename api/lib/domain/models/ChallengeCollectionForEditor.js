module.exports = class ChallengeCollectionForEditor {
  constructor({
    version,
    challenges,
  }) {
    this._version = version;
    this._challenges = challenges;
  }

  get version() { return this._version; }

  get isValidated() {
    const prototypeChallenge = this._challenges.find((challenge) => challenge.isPrototype);
    return prototypeChallenge.isValidated;
  }

  findChallenge(challengeId) {
    return this._challenges.find(({ id }) => challengeId === id) || null;
  }

  findPrototypeChallenge() {
    return this._challenges.find((challenge) => challenge.isPrototype) || null;
  }

  hasChallenge(challengeId) {
    const challenge = this.findChallenge(challengeId);
    return challenge !== null;
  }

  validateChallenge(challengeId, alternativeIdsToValidate) {
    const challengeToValidate = this.findChallenge(challengeId);
    if (challengeToValidate.isPrototype) {
      for (const challenge of this._challenges) {
        if (challenge.id === challengeToValidate.id) challenge.validate();
        else if (alternativeIdsToValidate.includes(challenge.id)) challenge.validate();
      }
    } else {
      const prototypeChallenge = this.findPrototypeChallenge();
      if (!prototypeChallenge?.isValidated) throw new Error(`Cannot validate challenge "${challengeId}": challenge's prototype not validated.`);
      challengeToValidate.validate();
    }
  }

  archive() {
    for (const challenge of this._challenges) challenge.archive();
  }

  toDTO() {
    return this._challenges.map((challenge) => challenge.toDTO());
  }
};
