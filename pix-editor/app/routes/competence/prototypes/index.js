import AuthenticatedRoute from '../../authenticated';

export default class IndexRoute extends AuthenticatedRoute {
  setupController() {
    super.setupController(...arguments);
    const competenceController = this.controllerFor('competence');
    competenceController.setSection('challenges');
    competenceController.maximizeLeft(false);
    const view = competenceController.view;
    if (!['production', 'workbench', 'workbench-list'].includes(view)) {
      competenceController.setView('production');
    }
  }
}
