import Route from '@ember/routing/route';

export default class CompetenceSkillsListRoute extends Route {

  model(params) {
    return this.store.findRecord('tube', params.tube_id)
      .then(tube => {
        let liveSkills = tube.liveSkills;
        liveSkills = liveSkills.filter(skill =>  skill.level === parseInt(params.level));
        return liveSkills.sort((a,b) => new Date(b.date) - new Date(a.date));
      });
  }

  setupController() {
    super.setupController(...arguments);
    const competenceController = this.controllerFor('competence');
    competenceController.setSection('skills');
    competenceController.setView('production');
  }
}
