import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class SidebarNavigationComponent extends Component {
  addFrameworkLabel = 'Créer un nouveau référentiel';

  @service currentData;
  @service access;

  @tracked _selectedFramework;

  get areas() {
    return this.currentData.getAreas();
  }

  get frameworks() {
    return this.currentData.getFrameworks() || [];
  }

  get framework() {
    return this.currentData.getFramework();
  }

  get selectedFramework() {
    if (this._selectedFramework) {
      return this._selectedFramework;
    }
    return this.frameworkList.find(item => {
      if (this.currentData.getFramework()) {
        return item.label === this.currentData.getFramework().name;
      }
    });
  }

  get frameworkList() {
    const frameworkList = this.frameworks.map(framework => ({
      label: framework.name,
      data: framework
    }));
    if (this.access.isAdmin()) {
      frameworkList.push({
        label: this.addFrameworkLabel,
        data: 'create'
      });
    }
    return frameworkList;
  }

  get mayCreateCompetence() {
    return this.access.isAdmin() && !this.currentData.isPixFramework;
  }

  get mayCreateArea() {
    return this.access.isAdmin() && !this.currentData.isPixFramework;
  }

  @action
  setFramework(item) {
    if (item.data === 'create') {
      return;
    }
    this.currentData.setFramework(item.data);
    this._selectedFramework = item;
  }
}
