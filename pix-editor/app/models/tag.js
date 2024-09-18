import Model, { attr, hasMany } from '@ember-data/model';

export default class TagModel extends Model {
  @attr title;
  @attr description;
  @attr notes;
  @attr pixId;

  // Une relation surprenante ☝️🤓
  @hasMany('skill', { async: true, inverse: null }) skills;
  @hasMany('tutorial', { async: true, inverse: 'tag' }) tutorials;
}
