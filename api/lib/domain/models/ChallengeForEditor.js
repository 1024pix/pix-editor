module.exports = class ChallengeForEditor {
  constructor({
    airtableId,
    id,
    genealogy,
    status,
    version,
  }) {
    this._airtableId = airtableId;
    this._id = id;
    this._genealogy = genealogy;
    this._status = status;
    this._version = version;
  }

  get id() { return this._id; }

  get version() { return this._version; }

  get isPrototype() { return this._genealogy === 'Prototype 1'; }

  get isValidated() { return this._status === 'validé'; }

  get isDraft() { return this._status === 'proposé';}

  get isOutdated() { return this._status === 'périmé'; }

  get isArchived() { return this._status === 'archivé'; }

  validate() {
    if (this.isValidated) throw new Error(`Cannot validate challenge "${this._id}": challenge already validated.`);
    if (this.isDraft) this._status = 'validé';
  }

  archive() {
    if (this.isValidated) this._status = 'archivé';
    else if (this.isDraft) this._status = 'périmé';
  }

  toDTO() {
    return {
      airtableId: this._airtableId,
      id: this._id,
      genealogy: this._genealogy,
      status: this._status,
      version: this._version,
    };
  }
};
