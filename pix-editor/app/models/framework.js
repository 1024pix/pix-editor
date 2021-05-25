import Model, { attr, hasMany } from '@ember-data/model';

export default class FrameworkModel extends Model {

  @attr name

  @hasMany('area') areas;
}
