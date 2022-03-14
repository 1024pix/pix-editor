import AuthenticatedRoute from '../../authenticated';

export default class CompetenceI18nIndexRoute extends AuthenticatedRoute {
  setupController() {
    super.setupController(...arguments);
    const competenceController = this.controllerFor('competence');
    competenceController.setSection('i18n');
    competenceController.setView(null);
    competenceController.maximizeLeft(false);
  }
}
