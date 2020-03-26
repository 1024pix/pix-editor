import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class SidebarNavigationComponent extends Component {
  @service currentData;

  get areas() {
    return this.currentData.getAreas();
  }

  get sources() {
    return this.currentData.getSources();
  }

  get source() {
    return this.currentData.getSource();
  }

  @action
  setSource(source) {
    this.currentData.setSource(source);
  }
}
