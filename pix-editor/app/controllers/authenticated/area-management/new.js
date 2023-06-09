import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Sentry from '@sentry/ember';

export default class AreaManagementNewController extends Controller {

  @service loader;
  @service notify;
  @service router;
  @service store;

  get area() {
    return this.model.area;
  }

  get framework() {
    return this.model.framework;
  }

  @action
  cancelEdit() {
    this.notify.message('Création du domaine annulé');
    this.router.transitionTo('authenticated');
    this.store.deleteRecord(this.area);
  }

  @action
  async save() {
    try {
      this.loader.start();
      this.area.framework = this.framework;
      await this.area.save();
      this.notify.message('Domaine créé');
      this.router.transitionTo('authenticated');
    } catch (error) {
      Sentry.captureException(error);
      console.log(error);
      this.notify.error('Erreur lors de la création du domaine');
    } finally {
      this.loader.stop();
    }
  }
}
