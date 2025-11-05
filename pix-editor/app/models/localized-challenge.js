import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import Challenge from 'pixeditor/models/challenge';

const inProductionCombinations = ['validé:validé', 'archivé:validé'];

export default class LocalizedChallengeModel extends Model {
  @attr embedURL;
  @attr defaultEmbedURL;
  @attr geography;
  @attr urlsToConsult;
  @attr locale;
  @attr status;
  @attr translations;
  @attr requireGafamWebsiteAccess;
  @attr isIncompatibleIpadCertif;
  @attr deafAndHardOfHearing;
  @attr isAwarenessChallenge;
  @attr toRephrase;
  @attr('boolean') hasEmbedInternalValidation;
  @attr('boolean') noValidationNeeded;
  @attr instruction;

  @belongsTo('challenge', { inverse: 'localizedChallenges', async: true }) challenge;
  @hasMany('attachment', { inverse: 'localizedChallenge', async: true }) attachments;

  static get STATUSES() {
    return {
      PLAY: Challenge.STATUSES.VALIDE,
      PAUSE: Challenge.STATUSES.PROPOSE,
    };
  }

  get isPrimaryChallenge() {
    return this.challenge.get('id') === this.id;
  }

  get piecesJointes() {
    const attachments = this.hasMany('attachments').value();
    if (!attachments) return null;
    return attachments.filter((attachment) => attachment.type === 'attachment' && !attachment.isDeleted);
  }

  get illustration() {
    const attachments = this.hasMany('attachments').value() ?? [];
    return attachments.find((attachment) => attachment.type === 'illustration' && !attachment.isDeleted);
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
    const piecesJointes = this.piecesJointes;
    if (piecesJointes && piecesJointes.length > 0) {
      return piecesJointes[0].filename.replace(/\.[^/.]+$/, '');
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
