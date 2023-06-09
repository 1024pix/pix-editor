import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Sentry from '@sentry/ember';


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
      this.router.transitionTo('authenticated.competence.skills', this.competence, { queryParams: { view: 'workbench' } });
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

  async _createWorkbench(frameworkName) {
    const theme = await this._createThemeWorkbench(this.competence, frameworkName);
    const tube = await this._createTubeWorkbench(theme, this.competence, frameworkName);
    await this._createSkillWorkbench(tube, frameworkName);
  }

  async _createThemeWorkbench(competence, frameworkName) {
    const themeWorkbenchName = this._getThemeWorkbenchName(this.competence.code, frameworkName);
    const workbenchTheme = this.store.createRecord('theme', {
      name: themeWorkbenchName,
      competence,
      index: 0
    });
    return await workbenchTheme.save();
  }

  _getThemeWorkbenchName(competenceCode, frameworkName) {
    const code =  competenceCode.replace('.', '_');
    return `workbench_${frameworkName}_${code}`;
  }

  async _createTubeWorkbench(theme, competence, frameworkName) {
    const title = `Tube pour l'atelier de la compétence ${this.competence.code} ${frameworkName}`;
    const tubeWorkbench = this.store.createRecord('tube', {
      name: '@workbench',
      title,
      theme,
      competence,
      pixId: this.idGenerator.newId('tube'),
    });
    return await tubeWorkbench.save();
  }

  async _createSkillWorkbench(tube, frameworkName) {
    const description = `Acquis pour l'atelier de la compétence ${this.competence.code} ${frameworkName}`;
    const skillWorkbench = this.store.createRecord('skill', {
      name: '@workbench',
      description,
      tube,
      pixId: this.idGenerator.newId('skill'),
    });
    return await skillWorkbench.save();
  }
}
