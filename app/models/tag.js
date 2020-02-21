import classic from 'ember-classic-decorator';
import Model, { attr, hasMany } from '@ember-data/model';

@classic
export default class TagModel extends Model {
  @attr title;
  @attr description;
  @attr notes;

  @hasMany('skill') skills;
  @hasMany('tutorial') tutorials;
}
