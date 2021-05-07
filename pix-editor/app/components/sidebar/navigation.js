import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class SidebarNavigationComponent extends Component {
  @service currentData;
  @service access;

  @tracked _selectedFramework;

  get areas() {
    return this.currentData.getAreas();
  }

  get frameworks() {
    return this.currentData.getFrameworks() || [];
  }

  get selectedFramework() {
    if (this._selectedFramework) {
      return this._selectedFramework;
    }
    return this.frameworkList.find(item => (item.data.name === this.currentData.getFramework().name));
  }

  get frameworkList() {
    return this.frameworks.map(framework => ({
      label: framework.name,
      data: framework
    }));
  }

  get mayCreateCompetence() {
    return this.access.isAdmin() && !this.currentData.isPixFramework;
  }

  @action
  setFramework(item) {
    this.currentData.setFramework(item.data);
    this._selectedFramework = item;
  }
}
