import Model, { attr, hasMany } from '@ember-data/model';

export default class BrokenUrlModel extends Model {
  @attr errorMessage;
  @attr statusCode;
  @attr url;

  @hasMany('skills', { async: true, inverse: null }) skills;
}
