import Route from '@ember/routing/route';

export default class IndexRoute extends Route {
  setupController() {
    super.setupController(...arguments);
    const competenceController = this.controllerFor('authenticated.competence');
    competenceController.setSection('quality');
    competenceController.setView(null);
    competenceController.maximizeLeft(false);
  }
}
