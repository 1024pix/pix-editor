import Route from '@ember/routing/route';

export default class CompetenceSkillsListRoute extends Route {

  model(params) {
    return this.store.findRecord('tube', params.tube_id)
      .then(tube => {
        return tube.filledSkills[params.level - 1];
      });
  }

  setupController() {
    super.setupController(...arguments);
    const competenceController = this.controllerFor('competence');
    competenceController.setSection('skills');
    competenceController.setView('production');
  }
}
