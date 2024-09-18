import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class ThemeModel extends Model {

  @attr pixId;
  @attr name;
  @attr nameEnUs;
  @attr index;

  @belongsTo('competence', { async: true, inverse: 'rawThemes' }) competence;
  @hasMany('tube', { async: true, inverse: 'theme' }) rawTubes;

  get tubes() {
    const rawTubes = this.hasMany('rawTubes').value();

    if (rawTubes === null) return [];

    return rawTubes.filter((tube) => tube.name !== '@workbench').sortBy('index');
  }

  get productionTubes() {
    return this.tubes.filter((tube) => tube.hasProductionSkills);
  }

  get hasProductionTubes() {
    return this.productionTubes.length > 0;
  }

  get hasSelectedProductionTube() {
    return this.selectedProductionTubeLength > 0;
  }

  get selectedProductionTubeLength() {
    return this.productionTubes.filter((tube) => tube.selectedLevel).length;
  }
}
