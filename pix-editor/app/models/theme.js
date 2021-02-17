import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class ThemeModel extends Model {

  @attr name;

  @belongsTo('competence') competence;
  @hasMany('tube') rawTubes;

  get tubes() {
    return this.rawTubes.filter(tube => tube.name !== '@workbench');
  }

  get productionTubes() {
    let allTubes = this.tubes;
    allTubes = allTubes.filter(tube => tube.hasProductionChallenge);
    return allTubes.sortBy('name');
  }

  get hasSelectedProductionTube() {
    return this.selectedProductionTubeLength > 0;
  }

  get selectedProductionTubeLength() {
    return this.productionTubes.filter(tube => tube.selectedLevel).length;
  }
}
