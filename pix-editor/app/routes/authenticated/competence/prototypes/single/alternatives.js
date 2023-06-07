import Route from '@ember/routing/route';

export default class AlternativesRoute extends Route {

  model() {
    return this.modelFor('authenticated.competence.prototypes.single');
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.maximizeRight(false);
  }

  resetController(controller) {
    controller.rightMaximized = false;
  }

}
