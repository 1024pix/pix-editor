module.exports = class SkillForEditor {
  constructor({
    airtableId,
    id,
    name,
    level,
    status,
  }) {
    this._airtableId = airtableId;
    this._id = id;
    this._name = name;
    this._level = level;
    this._status = status;
    this._challengeCollections = [];
  }

  get id() { return this._id; }

  get isWorkbench() { return this._name.startsWith('@workbench'); }

  get isActive() {return this._status === 'actif';}

  get isDraft() {return this._status === 'en construction';}

  get isArchived() {return this._status === 'archivé';}

  get level() {return this._level;}

  addChallengeCollection(challengeCollection) { this._challengeCollections.push(challengeCollection); }

  validateChallenge(challengeId, alternativeIdsToValidate) {
    if (this.isWorkbench) throw new Error(`Cannot validate challenge "${challengeId}": challenge still in workbench.`);
    const challengeCollection = this._challengeCollections.find((challengeCollection) => challengeCollection.hasChallenge(challengeId));
    const currentValidatedChallengeCollection = this._challengeCollections.find((challengeCollection) => challengeCollection.isValidated);
    challengeCollection.validateChallenge(challengeId, alternativeIdsToValidate);
    if (currentValidatedChallengeCollection && currentValidatedChallengeCollection.version !== challengeCollection.version) currentValidatedChallengeCollection.archive();
    this._status = 'actif';
  }

  findChallenge(challengeId) {
    for (const challengeCollection of this._challengeCollections) {
      const challenge = challengeCollection.findChallenge(challengeId);
      if (challenge) return challenge;
    }
    return null;
  }

  hasChallenge(challengeId) {
    const challenge = this.findChallenge(challengeId);
    return challenge !== null;
  }

  archive() {
    const currentValidatedChallengeCollection = this._challengeCollections.find((challengeCollection) => challengeCollection.isValidated);
    currentValidatedChallengeCollection.archive();
    this._status = 'archivé';
  }

  toDTO() {
    return {
      airtableId: this._airtableId,
      id: this._id,
      name: this._name,
      level: this._level,
      status: this._status,
      challenges: this._challengeCollections.flatMap((challengeCollection) => challengeCollection.toDTO()),
    };
  }
};
