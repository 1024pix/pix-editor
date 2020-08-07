import Route from '@ember/routing/route';

export default class SingleRoute extends Route {

  model(params) {
    return this.store.findRecord('tube', params.tube_id)
      .then(tube => {
        return tube.filledDeadSkills[params.level];
      });
  }

  setupController() {
    super.setupController(...arguments);
    const competenceController = this.controllerFor('competence');
    competenceController.setSection('skills');
    competenceController.setView('history');
    competenceController.maximizeLeft(false);
  }
}
