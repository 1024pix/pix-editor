import Model, { attr, belongsTo } from '@ember-data/model';

export default class LocalizedChallengeModel extends Model {
  @attr embedURL;
  @attr locale;

  @belongsTo('challenge') challenge;

  get isPrimaryChallenge() {
    return this.challenge.get('id') === this.id;
  }
}
