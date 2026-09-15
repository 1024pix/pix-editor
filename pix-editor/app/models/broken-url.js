import Model, { attr, hasMany } from '@ember-data/model';

export default class BrokenUrlModel extends Model {
  @attr errorMessage;
  @attr statusCode;
  @attr url;

  @hasMany('skill', { async: true, inverse: null }) skills;
  @hasMany('tutorial', { async: true, inverse: null }) tutorials;
  @hasMany('localized-challenge', { async: true, inverse: null }) localizedChallenges;
}
