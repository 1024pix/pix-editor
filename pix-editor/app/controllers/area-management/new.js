import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Sentry from '@sentry/ember';

export default class AreaManagementNewController extends Controller {

  @service notify;
  @service loader;

  get area() {
    return this.model.area;
  }

  get framework() {
    return this.model.framework;
  }

  @action
  cancelEdit() {
    this.store.deleteRecord(this.area);
    this.notify.message('Création du domaine annulé');
    this.transitionToRoute('index');
  }

  @action
  async save() {
    try {
      this.loader.start();
      this.area.framework = this.framework;
      await this.area.save();
      this.notify.message('Domaine créé');
      this.transitionToRoute('index');
    } catch (error) {
      Sentry.captureException(error);
      console.log(error);
      this.notify.error('Erreur lors de la création du domaine');
    } finally {
      this.loader.stop();
    }
  }
}
