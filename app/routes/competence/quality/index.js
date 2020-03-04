import Route from '@ember/routing/route';

export default class IndexRoute extends Route {
  setupController() {
    super.setupController(...arguments);
    const competenceController = this.controllerFor('competence');
    competenceController.set('section', 'quality');
    competenceController.set('view', null);
    competenceController.set('firstMaximized', false);
  }
}
