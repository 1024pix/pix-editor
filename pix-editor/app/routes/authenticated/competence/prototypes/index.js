import Route from '@ember/routing/route';

export default class PrototypesIndexRoute extends Route {
  setupController(...args) {
    super.setupController(...args);
    const competenceController = this.controllerFor('authenticated.competence');
    competenceController.setSection('challenges');
    competenceController.maximizeLeft(false);
    const view = competenceController.view;
    if (!['production', 'workbench', 'workbench-list'].includes(view)) {
      competenceController.setView('production');
    }
  }
}
