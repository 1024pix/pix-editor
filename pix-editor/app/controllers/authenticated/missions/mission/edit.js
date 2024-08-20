import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class MissionEditController extends Controller {
  @service router;
  @service notifications;

  @action
  async submitMission(formData) {
    try {
      this.model.mission.name = formData.name;
      this.model.mission.competenceId = formData.competenceId;
      this.model.mission.status = formData.status;
      this.model.mission.thematicIds = formData.thematicIds;
      this.model.mission.validatedObjectives = formData.validatedObjectives;
      this.model.mission.learningObjectives = formData.learningObjectives;
      this.model.mission.introductionMediaUrl = formData.introductionMediaUrl;
      this.model.mission.introductionMediaType = formData.introductionMediaType;
      this.model.mission.introductionMediaAlt = formData.introductionMediaAlt;
      this.model.mission.documentationUrl = formData.documentationUrl;
      await this.model.mission.save();
      this.notifications.success('Mission mise à jour avec succès.');
      this.router.transitionTo('authenticated.missions.mission');
    } catch (err) {
      this.model.mission.rollbackAttributes();

      if (err.errors?.[0]) {
        await this.notifications.error(err.errors[0].detail);
        return;
      }
      await this.notifications.error('Une erreur est survenue lors de la mise à jour de la mission.');
    }
  }

  @action
  async goBackToMission() {
    this.router.transitionTo('authenticated.missions.mission');
  }
}
