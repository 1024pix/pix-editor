import DS from 'ember-data';
import {sort} from '@ember/object/computed';
import { computed } from '@ember/object';


export default DS.Model.extend({
  name: DS.attr(),
  code:DS.attr(),
  competences: DS.hasMany('competence'),
  competencesSorting: Object.freeze(['code']),
  sortedCompetences: sort('competences','competencesSorting'),
  getSelectedTubeCount: computed('competences.@each.{selectedProductionTubeCount,productionTubeCount}', function(){
   let selectedProductionTubeCount = 0, productionTubeCount = 0;
    const competences = this.get('competences');
    competences.forEach(competence=>{
      selectedProductionTubeCount += competence.selectedProductionTubeCount;
      productionTubeCount += competence.productionTubeCount;
    });
    return {selectedProductionTubeCount, productionTubeCount}
  })
});
