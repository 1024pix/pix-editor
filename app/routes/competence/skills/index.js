import Route from '@ember/routing/route';

export default class IndexRoute extends Route {
  setupController() {
    super.setupController(...arguments);
    const competenceController = this.controllerFor('competence');
    competenceController.section = 'skills';
    competenceController.view = null;
    competenceController.firstMaximized = false;
  }
}
