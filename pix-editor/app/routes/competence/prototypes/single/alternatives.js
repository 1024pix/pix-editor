import AuthenticatedRoute from '../../../authenticated';

export default class AlternativesRoute extends AuthenticatedRoute {

  model() {
    return this.modelFor('competence.prototypes.single');
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.maximizeRight(false);
  }

  resetController(controller) {
    controller.rightMaximized = false;
  }

}
