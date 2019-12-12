import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({

  filterCompetences:computed('area.sortedCompetences.@each.selectedProductionTubeCount', 'filter', function(){
    const area = this.get('area');
    const filter = this.get('filter');
    if(filter){
      return  area.get('sortedCompetences').filter(competence=>{
        return competence.selectedProductionTubeCount !== 0
      })
    }
    return area.get('sortedCompetences')
  })

});
