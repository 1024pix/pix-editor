import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Sentry from '@sentry/ember';


export default class CompetenceManagementNewController extends Controller {

  @service idGenerator;
  @service notify;
  @service loader;

  creation = true;

  get competence() {
    return this.model.competence;
  }

  @action
  cancelEdit() {
    this.store.deleteRecord(this.competence);
    this.edition = false;
    this.notify.message('Création de la compétence annulée');
    this.transitionToRoute('index');
  }

  @action
  async save() {
    const area = this.model.area;
    try {
      this.loader.start();
      await this._createCompetence(area);
      this.notify.message('Compétence créée');
      await this._createWorkbench();
      this.notify.message('Atelier créé');
      this.edition = false;
      this.transitionToRoute('competence.skills', this.competence, { queryParams: { view: 'workbench' } });
    } catch (error) {
      Sentry.captureException(error);
      console.log(error);
      this.notify.error('Erreur lors de la création de la compétence');
    } finally {
      this.loader.stop();
    }
  }

  async _createCompetence(area) {
    this.competence.area = area;
    await this.competence.save();
  }

  async _createWorkbench() {
    const theme = await this._createThemeWorkbench(this.competence);
    const tube = await this._createTubeWorkbench(theme, this.competence);
    await this._createSkillWorkbench(tube, this.competence);
  }

  async _createThemeWorkbench(competence) {
    const themeWorkbenchName = this._getThemeWorkbenchName(this.competence.code);
    const workbenchTheme = this.store.createRecord('theme', {
      name: themeWorkbenchName,
      competence,
      index: 0
    });
    return await workbenchTheme.save();
  }

  _getThemeWorkbenchName(competenceCode) {
    const code =  competenceCode.replace('.', '_');
    return `workbench_${code}`;
  }

  async _createTubeWorkbench(theme, competence) {
    const tubeWorkbench = this.store.createRecord('tube', {
      name: '@workbench',
      theme,
      competence,
      pixId: this.idGenerator.newId(),
    });
    return await tubeWorkbench.save();
  }

  async _createSkillWorkbench(tube) {
    const skillWorkbench = this.store.createRecord('skill', {
      name: '@workbench',
      tube,
      pixId: this.idGenerator.newId(),
    });
    return await skillWorkbench.save();
  }
}
