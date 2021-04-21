import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class SidebarNavigationComponent extends Component {
  @service currentData;
  @service access;

  get areas() {
    return this.currentData.getAreas();
  }

  get sources() {
    return this.currentData.getSources();
  }

  get source() {
    return this.currentData.getSource();
  }

  get mayCreateCompetence() {
    return this.access.isAdmin() && !this.currentData.isPixSource;
  }

  @action
  setSource(source) {
    this.currentData.setSource(source);
  }
}
