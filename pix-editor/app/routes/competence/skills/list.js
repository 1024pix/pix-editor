import Route from '@ember/routing/route';

export default class CompetenceSkillsListRoute extends Route {

  model(params) {
    return this.store.findRecord('tube', params.tube_id)
      .then(tube => {
        return { tube, liveSkills: tube.liveSkills };
      })
      .then(({ tube,liveSkills }) => {
        const liveSkillsFiltered = liveSkills.filter(skill => skill.level === parseInt(params.level));
        const sortedSkills = liveSkillsFiltered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return { tube, sortedSkills };
      });
  }

  setupController() {
    super.setupController(...arguments);
    const competenceController = this.controllerFor('competence');
    competenceController.setSection('skills');
    competenceController.setView('production');
  }
}
