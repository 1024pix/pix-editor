import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class TargetProfileTubeThematicResultComponent extends Component {

  @action
  clickOnTube(tube) {
    console.log(tube);
  }
}
