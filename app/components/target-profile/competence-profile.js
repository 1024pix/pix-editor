import classic from 'ember-classic-decorator';
import { action, computed } from '@ember/object';
import Component from '@ember/component';

@classic
export default class CompetenceProfile extends Component {
  @computed('competence.productionTubes.@each.selectedLevel', 'filter')
  get filterTube() {
    const filter = this.get('filter');
    const competence = this.get('competence');
    if(filter){
      return competence.get('productionTubes').filter(tube => {
        return tube.selectedLevel
      })
    }
    return competence.get('productionTubes');
  }

  @action
  clickOnTube(tube) {
    const showTubeDetails = this.get('showTubeDetails');
    const isSelected = tube.get('selectedLevel');
    if (showTubeDetails) {
      this.get('displayTube')(tube);
    } else if (isSelected) {
      this.get('clearTube')(tube);
    } else {
      this.get('setTubeLevel')(tube);
    }
  }
}
