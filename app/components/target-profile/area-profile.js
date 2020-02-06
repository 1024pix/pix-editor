import classic from 'ember-classic-decorator';
import { computed } from '@ember/object';
import Component from '@ember/component';

@classic
export default class AreaProfile extends Component {
  @computed('area.sortedCompetences.@each.selectedProductionTubeCount', 'filter')
  get filterCompetences() {
    const area = this.get('area');
    const filter = this.get('filter');
    if(filter){
      return  area.get('sortedCompetences').filter(competence=>{
        return competence.selectedProductionTubeCount !== 0
      })
    }
    return area.get('sortedCompetences')
  }
}
