import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class TargetProfileThemeProfileComponent extends Component {

  get filteredTubes() {
    const theme = this.args.theme;
    if (this.args.filter) {
      return theme.productionTubes.filter(tube => tube.selectedLevel);
    }
    return theme.productionTubes;
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

  @action
  clickOnThematicResultTube(tube) {
    if (this.args.showTubeDetails) {
      this.args.displayThematicResultTube(tube);
    } else if (tube.selectedThematicResultLevel) {
      tube.selectedThematicResultLevel = false;
    } else {
      tube.selectedThematicResultLevel = tube.selectedLevel;
    }
  }
}
