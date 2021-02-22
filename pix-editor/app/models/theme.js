import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class ThemeModel extends Model {

  @attr name;

  @belongsTo('competence') competence;
  @hasMany('tube') rawTubes;

  get tubes() {
    return this.rawTubes.filter(tube => tube.name !== '@workbench').sortBy('name');
  }

  get productionTubes() {
    return this.tubes.filter(tube => tube.hasProductionChallenge);
  }

  get hasProductionTubes() {
    return this.productionTubes.length > 0;
  }

  get hasSelectedProductionTube() {
    return this.selectedProductionTubeLength > 0;
  }

  get selectedProductionTubeLength() {
    return this.productionTubes.filter(tube => tube.selectedLevel).length;
  }
}
