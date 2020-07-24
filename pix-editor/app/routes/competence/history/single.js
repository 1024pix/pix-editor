import Route from '@ember/routing/route';

export default class SingleRoute extends Route {

  model(params) {
    return this.store.query('skill', { filterByFormula:`FIND('${params.skill_name}', {Nom})`});
  }

  setupController() {
    super.setupController(...arguments);
    const competenceController = this.controllerFor('competence');
    competenceController.setSection('skills');
    competenceController.setView(null);
    competenceController.setSkillView('history');
    competenceController.maximizeLeft(false);
  }
}
