import Route from '@ember/routing/route';

export default class IndexRoute extends Route {
  setupController() {
    super.setupController(...arguments);
    const competenceController = this.controllerFor('competence');
    competenceController.setSection('skills');
    const view = competenceController.view;
    if (!['production', 'history'].includes(view)) {
      competenceController.setView('production');
    }
    competenceController.maximizeLeft(false);
  }
}
