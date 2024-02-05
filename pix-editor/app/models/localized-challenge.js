import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

const inProductionCombinations = [
  'validé:validé',
  'archivé:validé',
];

export default class LocalizedChallengeModel extends Model {
  @attr embedURL;
  @attr locale;
  @attr status;

  @belongsTo('challenge') challenge;
  @hasMany('attachment', { inverse: 'localizedChallenge' }) files;

  get isPrimaryChallenge() {
    return this.challenge.get('id') === this.id;
  }

  get illustration() {
    return this.files.find((file) => file.type === 'illustration' && !file.isDeleted);
  }

  get attachments() {
    return this.files.filter((file) => file.type === 'attachment' && !file.isDeleted);
  }

  get statusCSS() {
    return this.isInProduction ? 'validated' : 'suggested';
  }

  get statusText() {
    return this.isInProduction ? 'En prod' : 'Pas en prod';
  }

  get isInProduction() {
    return inProductionCombinations.includes(`${this.challenge.get('status')}:${this.status}`);
  }

  get isStatusEditable() {
    return ['validé', 'archivé'].includes(this.challenge.get('status'));
  }

  get _firstAttachmentBaseName() {
    const attachments = this.attachments;
    if (attachments && attachments.length > 0) {
      return attachments[0].filename.replace(/\.[^/.]+$/, '');
    }
    return null;
  }

  get attachmentBaseName() {
    if (this._definedBaseName) {
      return this._definedBaseName;
    }
    return this._firstAttachmentBaseName;
  }

  set attachmentBaseName(value) {
    this._definedBaseName = value;
    return value;
  }

  baseNameUpdated() {
    return this._firstAttachmentBaseName !== this.attachmentBaseName;
  }
}
