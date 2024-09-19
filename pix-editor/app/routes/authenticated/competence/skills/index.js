import Route from '@ember/routing/route';

export default class SkillsIndexRoute extends Route {
  setupController(...args) {
    super.setupController(...args);
    const competenceController = this.controllerFor('authenticated.competence');
    competenceController.setSection('skills');
    const view = competenceController.view;
    if (!['production', 'workbench', 'draft'].includes(view)) {
      competenceController.setView('production');
    }
    competenceController.maximizeLeft(false);
  }
}
