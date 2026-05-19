import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class MissionController extends Controller {
  @service router;
  @service notifications;

  @action
  async createMission(formData) {
    try {
      await this.model.mission.save({ adapterOptions: formData });
      this.notifications.sendSuccess('Mission créé avec succès.');
      if (this.model.mission.hasWarnings()) {
        this.notifications.sendWarning(this.model.mission.warnings.join('<br>'));
      }
      this.router.transitionTo('authenticated.missions.list');
    } catch (err) {
      if (err.errors?.[0]) {
        this.notifications.sendError(err.errors[0].detail);
        return;
      }

      this.notifications.sendError('Une erreur est survenue lors de la création de la mission.');
    }
  }

  @action
  async goBackToList() {
    this.router.transitionTo('authenticated.missions.list');
  }
}
