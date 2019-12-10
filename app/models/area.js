import DS from 'ember-data';
import {sort} from '@ember/object/computed';
import { computed } from '@ember/object';


export default DS.Model.extend({
  name: DS.attr(),
  code:DS.attr(),
  competences: DS.hasMany('competence'),
  competencesSorting: Object.freeze(['code']),
  sortedCompetences: sort('competences','competencesSorting'),
  selectedProductionTubeCount:computed('competences.@each.selectedProductionTubeCount', function() {
    return this.get('competences').reduce((count, competence) => {
      return count+competence.get('selectedProductionTubeCount');
    }, 0);
  }),
  productionTubeCount:computed('competences.@each.productionTubeCount', function() {
    return this.get('competences').reduce((count, competence) => {
      return count+competence.get('productionTubeCount');
    }, 0);
  })
});
