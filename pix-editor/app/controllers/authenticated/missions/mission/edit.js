import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class MissionEditController extends Controller {
  @service router;
  @service notifications;

  @action
  async submitMission(formData) {
    try {
      this.model.mission.name = formData.name;
      this.model.mission.cardImageUrl = formData.cardImageUrl;
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
      this.notifications.sendSuccess('Mission mise à jour avec succès.');
      if (this.model.mission.hasWarnings()) {
        this.notifications.sendWarning(this.model.mission.warnings.join('<br>'));
      }
      this.router.transitionTo('authenticated.missions.mission');
    } catch (err) {
      this.model.mission.rollbackAttributes();

      if (err.errors?.[0]) {
        this.notifications.sendError(err.errors[0].detail);
        return;
      }
      this.notifications.sendError('Une erreur est survenue lors de la mise à jour de la mission.');
    }
  }

  @action
  async goBackToMission() {
    this.router.transitionTo('authenticated.missions.mission');
  }
}
