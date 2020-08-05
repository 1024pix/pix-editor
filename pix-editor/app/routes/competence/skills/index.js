import Route from '@ember/routing/route';

export default class IndexRoute extends Route {
  setupController() {
    super.setupController(...arguments);
    const competenceController = this.controllerFor('competence');
    competenceController.setSection('skills');
    competenceController.setView('production');
    competenceController.maximizeLeft(false);
  }
}
