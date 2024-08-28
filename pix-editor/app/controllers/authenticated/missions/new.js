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
      if (this.model.mission.hasWarnings()) {
        this.notifications.warning(this.model.mission.warnings.join('<br>'), { clearDuration: 5000, htmlContent: true });
      }
      this.router.transitionTo('authenticated.missions.list');
    } catch (err) {
      if (err.errors?.[0]) {
        await this.notifications.error(err.errors[0].detail);
        return;
      }

      await this.notifications.error('Une erreur est survenue lors de la création de la mission.');
    }
  }

  @action
  async goBackToList() {
    this.router.transitionTo('authenticated.missions.list');
  }
}
