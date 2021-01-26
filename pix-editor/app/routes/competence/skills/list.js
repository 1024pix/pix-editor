import Route from '@ember/routing/route';

export default class CompetenceSkillsListRoute extends Route {

  model(params) {
    return this.store.findRecord('tube', params.tube_id)
      .then(tube => {
        const intLevel = parseInt(params.level);
        return { tube, sortedSkills: tube.filledSkills[intLevel - 1] };
      });
  }

  setupController() {
    super.setupController(...arguments);
    const competenceController = this.controllerFor('competence');
    competenceController.setSection('skills');
    competenceController.setView('skill-workbench');
  }
}
