import Model, { attr, belongsTo } from '@ember-data/model';

export default class LocalizedChallengeModel extends Model {
  @attr embedURL;
  @attr locale;

  @belongsTo('challenge') challenge;
}
