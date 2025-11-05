import Route from '@ember/routing/route';

export default class AlternativesRoute extends Route {
  async model() {
    const prototype = this.modelFor('authenticated.competence.prototypes.single');
    await prototype.skill.get('challenges');
    return prototype;
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.maximizeRight(false);
  }

  resetController(controller) {
    controller.rightMaximized = false;
  }
}
