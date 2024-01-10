import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class MissionController extends Controller {
  @service router;
  @service notifications;

  @action
  async createMission(formData) {
    try {
      await this.model.mission.save({ adapterOptions: formData });
      this.notifications.success('Mission créé avec succès.');
      this.router.transitionTo('authenticated.missions.list');
    } catch (err) {
      this.model.mission.deleteRecord();
      await this.notifications.error('Une erreur est survenue lors de la création de la mission.');
    }
  }

  @action
  async goBackToList() {
    this.router.transitionTo('authenticated.missions.list');
  }
}
