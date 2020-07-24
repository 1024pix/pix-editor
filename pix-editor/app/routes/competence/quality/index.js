import Route from '@ember/routing/route';

export default class IndexRoute extends Route {
  setupController() {
    super.setupController(...arguments);
    const competenceController = this.controllerFor('competence');
    competenceController.setSection('quality');
    competenceController.setView(null);
    competenceController.setSkillView(null);
    competenceController.maximizeLeft(false);
  }
}
