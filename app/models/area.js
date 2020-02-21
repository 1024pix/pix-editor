import classic from 'ember-classic-decorator';
import Model, { attr, hasMany } from '@ember-data/model';
import {sort} from '@ember/object/computed';
import { computed } from '@ember/object';


@classic
export default class AreaModel extends Model {
  @attr name;
  @attr code;

  @hasMany('competence') competences;

  competencesSorting = Object.freeze(['code']);

  @sort('competences','competencesSorting')
  sortedCompetences;

  @computed('competences.@each.selectedProductionTubeCount')
  get selectedProductionTubeCount() {
    return this.get('competences').reduce((count, competence) => {
      return count+competence.get('selectedProductionTubeCount');
    }, 0);
  }

  @computed('competences.@each.productionTubeCount')
  get productionTubeCount() {
    return this.get('competences').reduce((count, competence) => {
      return count+competence.get('productionTubeCount');
    }, 0);
  }

}
