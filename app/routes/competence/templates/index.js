import Route from '@ember/routing/route';

export default class IndexRoute extends Route {
  setupController() {
    super.setupController(...arguments);
    const competenceController = this.controllerFor('competence');
    competenceController.section = 'challenges';
    competenceController.firstMaximized = false;
    if (competenceController.view === null) {
      competenceController.view = 'production';
    }
  }
}
