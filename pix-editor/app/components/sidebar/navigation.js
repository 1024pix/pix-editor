import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import * as Sentry from '@sentry/ember';

export default class SidebarNavigationComponent extends Component {
  addFrameworkLabel = 'Créer un nouveau référentiel';

  @service access;
  @service currentData;
  @service loader;
  @service notify;
  @service router;
  @service store;

  @tracked _selectedFramework;
  @tracked newFramework;
  @tracked displayNewFrameworkPopIn;

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
      this._openNewFrameworkPopIn();
      return;
    }
    this.currentData.setFramework(item.data);
    this._selectedFramework = item;
  }

  @action
  _openNewFrameworkPopIn() {
    this.newFramework = this.store.createRecord('framework', {});
    this.displayNewFrameworkPopIn = true;
  }

  @action
  closeNewFrameworkPopIn() {
    this.store.deleteRecord(this.newFramework);
    this.displayNewFrameworkPopIn = false;
  }

  @action
  async saveFramework() {
    try {
      const router = this.router;
      this.loader.start();
      await this.newFramework.save();
      this.setFramework({
        label: this.newFramework.name,
        data: this.newFramework
      });
      this.notify.message('Référentiel créé');
      this.displayNewFrameworkPopIn = false;
      router.transitionTo('authenticated');
    } catch (error) {
      Sentry.captureException(error);
      console.log(error);
      this.notify.error('Erreur lors de la création du Référentiel');
    } finally {
      this.loader.stop();
    }
  }
}
