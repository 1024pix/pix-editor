import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class MissionEditController extends Controller {
  @service router;
  @service notifications;

  @action
  async editMission(formData) {
    try {
      this.model.mission.name = formData.name;
      this.model.mission.competenceId = formData.competenceId;
      this.model.mission.status = formData.status;
      this.model.mission.thematicId = formData.thematicId;
      this.model.mission.validatedObjectives = formData.validatedObjectives;
      this.model.mission.learningObjectives = formData.learningObjectives;
      await this.model.mission.save();
      this.notifications.success('Mission mise à jour avec succès.');
      this.router.transitionTo('authenticated.missions.mission');
    } catch (err) {
      this.model.mission.rollbackAttributes();
      await this.notifications.error('Une erreur est survenue lors de la mise à jour de la mission.');
    }
  }

  @action
  async goBackToList() {
    this.router.transitionTo('authenticated.missions.mission');
  }
}
