import Model, {attr, hasMany} from '@ember-data/model';
import {sort} from '@ember/object/computed';


export default class AreaModel extends Model {
  @attr name;
  @attr code;

  @hasMany('competence') competences;

  competencesSorting = Object.freeze(['code']);

  @sort('competences','competencesSorting')
  sortedCompetences;

  get selectedProductionTubeCount() {
    return this.competences.reduce((count, competence) => {
      return count + competence.selectedProductionTubeCount;
    }, 0);
  }

  get productionTubeCount() {
    return this.competences.reduce((count, competence) => {
      return count + competence.productionTubeCount;
    }, 0);
  }

  get source() {
    return this.competences.firstObject.source;
  }

}
