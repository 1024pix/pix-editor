import Route from '@ember/routing/route';

export default class QualityIndexRoute extends Route {
  setupController(...args) {
    super.setupController(...args);
    const competenceController = this.controllerFor('authenticated.competence');
    competenceController.setSection('quality');
    competenceController.setView(null);
    competenceController.maximizeLeft(false);
  }
}
