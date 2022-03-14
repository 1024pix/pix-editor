import AuthenticatedRoute from '../../authenticated';

export default class IndexRoute extends AuthenticatedRoute {
  setupController() {
    super.setupController(...arguments);
    const competenceController = this.controllerFor('competence');
    competenceController.setSection('quality');
    competenceController.setView(null);
    competenceController.maximizeLeft(false);
  }
}
