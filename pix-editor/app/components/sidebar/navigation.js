import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
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

  get selectedFrameworkId() {
    return this.framework?.id;
  }

  get frameworkOptionList() {
    const frameworkList = this.frameworks.map((framework) => ({
      label: framework.name,
      value: framework.id,
    }));
    if (this.access.isAdmin()) {
      frameworkList.push({
        label: this.addFrameworkLabel,
        value: 'create',
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
  setFramework(frameworkId) {
    if (frameworkId === 'create') {
      this._openNewFrameworkPopIn();
      return;
    }
    const framework = this.frameworks.find(({ id }) => id === frameworkId);
    this.currentData.setFramework(framework);
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
      this.setFramework(this.newFramework.id);
      this.notify.message('Référentiel créé');
      this.displayNewFrameworkPopIn = false;
      router.transitionTo('authenticated');
    } catch (error) {
      Sentry.captureException(error);
      console.error(error);
      this.notify.error('Erreur lors de la création du Référentiel');
    } finally {
      this.loader.stop();
    }
  }
}
