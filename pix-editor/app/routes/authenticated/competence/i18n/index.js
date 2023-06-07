import Route from '@ember/routing/route';

export default class CompetenceI18nIndexRoute extends Route {
  setupController() {
    super.setupController(...arguments);
    const competenceController = this.controllerFor('authenticated.competence');
    competenceController.setSection('i18n');
    competenceController.setView(null);
    competenceController.maximizeLeft(false);
  }
}
