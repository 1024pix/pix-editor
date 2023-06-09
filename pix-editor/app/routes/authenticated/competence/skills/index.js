import Route from '@ember/routing/route';

export default class IndexRoute extends Route {
  setupController() {
    super.setupController(...arguments);
    const competenceController = this.controllerFor('authenticated.competence');
    competenceController.setSection('skills');
    const view = competenceController.view;
    if (!['production', 'workbench', 'draft'].includes(view)) {
      competenceController.setView('production');
    }
    competenceController.maximizeLeft(false);
  }
}
