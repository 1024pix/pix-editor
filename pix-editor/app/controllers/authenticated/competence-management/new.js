import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import * as Sentry from '@sentry/ember';

export default class CompetenceManagementNewController extends Controller {

  @service idGenerator;
  @service loader;
  @service notify;
  @service router;
  @service store;

  creation = true;

  get competence() {
    return this.model.competence;
  }

  @action
  cancelEdit() {
    this.edition = false;
    this.notify.message('Création de la compétence annulée');
    this.router.transitionTo('authenticated');
    this.store.deleteRecord(this.competence);
  }

  @action
  async save() {
    const area = this.model.area;
    try {
      const framework = await area.framework;
      this.loader.start();
      await this._createCompetence(area);
      this.notify.message('Compétence créée');
      await this._createWorkbench(framework.name);
      this.notify.message('Atelier créé');
      this.edition = false;
      this.router.transitionTo('authenticated.competence.skills', this.competence.id, { queryParams: { view: 'workbench' } });
    } catch (error) {
      Sentry.captureException(error);
      this.notify.error('Erreur lors de la création de la compétence');
    } finally {
      this.loader.stop();
    }
  }

  async _createCompetence(area) {
    this.competence.area = area;
    await this.competence.save();
  }

  async _createWorkbench(frameworkName) {
    const [tube] = await this.competence.rawTubes;
    await this._createSkillWorkbench(tube, frameworkName);
  }

  async _createSkillWorkbench(tube, frameworkName) {
    const description = `Acquis pour l'atelier de la compétence ${this.competence.code} ${frameworkName}`;
    const skillWorkbench = this.store.createRecord('skill', {
      level: 0,
      description,
      tube,
    });
    return await skillWorkbench.save();
  }
}
