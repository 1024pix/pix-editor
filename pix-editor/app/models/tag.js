import Model, { attr, hasMany } from '@ember-data/model';

export default class TagModel extends Model {
  @attr title;
  @attr description;
  @attr notes;
  @attr pixId;

  @hasMany('skill') skills;
  @hasMany('tutorial') tutorials;
}
