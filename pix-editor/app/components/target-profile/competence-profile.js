import Component from '@glimmer/component';
import {action} from '@ember/object';

export default class CompetenceProfile extends Component {

  get filteredTubes() {
    const competence = this.args.competence;
    if (this.args.filter) {
      return competence.productionTubes.filter(tube => tube.selectedLevel);
    }
    return competence.productionTubes;
  }

  @action
  clickOnTube(tube) {
    if (this.args.showTubeDetails) {
      this.args.displayTube(tube);
    } else if (tube.selectedLevel) {
      this.args.clearTube(tube);
    } else {
      this.args.setTubeLevel(tube);
    }
  }
}
