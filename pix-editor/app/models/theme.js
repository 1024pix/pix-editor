import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class ThemeModel extends Model {

  @attr name;

  @belongsTo('competence') competence;
  @hasMany('tube') rawTubes;

  get tubes() {
    return this.rawTubes.filter(tube => tube.name !== '@workbench');
  }

}
