import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class CompetenceManagementNewController extends Controller {
  @service loader;
  @service notifications;
  @service router;
  @service store;

  creation = true;

  get competence() {
    return this.model.competence;
  }

  @action
  cancelEdit() {
    this.edition = false;
    this.notifications.sendSuccess('Création de la compétence annulée');
    this.router.transitionTo('authenticated');
    this.store.deleteRecord(this.competence);
  }

  @action
  setDescription(value) {
    this.model.competence.description = value;
  }

  @action
  setTitle(value) {
    this.model.competence.title = value;
  }

  @action
  setTitleEn(value) {
    this.model.competence.titleEn = value;
  }

  @action
  setDescriptionEn(value) {
    this.model.competence.descriptionEn = value;
  }

  @action
  async save() {
    const area = this.model.area;
    try {
      this.loader.start();
      await this._createCompetence(area);
      this.notifications.sendSuccess('Compétence créée');
      this.edition = false;
      this.router.transitionTo('authenticated.competence.skills', this.competence.id, {
        queryParams: { view: 'workbench' },
      });
    } catch (error) {
      /* eslint-disable-next-line no-console */
      console.error(error);
      this.notifications.sendError('Erreur lors de la création de la compétence');
    } finally {
      this.loader.stop();
    }
  }

  async _createCompetence(area) {
    this.competence.area = area;
    await this.competence.save();
  }
}
