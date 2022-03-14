import AuthenticatedRoute from '../../authenticated';

export default class IndexRoute extends AuthenticatedRoute {
  setupController() {
    super.setupController(...arguments);
    const competenceController = this.controllerFor('competence');
    competenceController.setSection('skills');
    const view = competenceController.view;
    if (!['production', 'workbench', 'draft'].includes(view)) {
      competenceController.setView('production');
    }
    competenceController.maximizeLeft(false);
  }
}
