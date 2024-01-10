import Model, { attr, belongsTo } from '@ember-data/model';

export default class LocalizedChallengeModel extends Model {
  @attr embedURL;
  @attr locale;
  @attr status;

  @belongsTo('challenge') challenge;

  get isPrimaryChallenge() {
    return this.challenge.get('id') === this.id;
  }

  get localizedStatus() {
    const challengeStatus = this.challenge.get('status');
    return challengeStatus === 'validé' ? this.status : challengeStatus;
  }

  get statusCSS() {
    switch (this.localizedStatus) {
      case 'validé':
        return 'validated';
      case 'proposé':
        return 'suggested';
      case 'archivé':
        return 'archived';
      case 'périmé':
        return 'deleted';
      default:
        return '';
    }
  }

  get statusText() {
    return this.localizedStatus === 'validé' ? 'En prod' : 'Pas en prod';
  }
}
