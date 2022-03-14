import AuthenticatedRoute from '../../../authenticated';

export default class AlternativesRoute extends AuthenticatedRoute {

  model() {
    return this.modelFor('competence.prototypes.single');
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.maximizeRight(false);
  }

  renderTemplate() {
    this.render('competence/prototypes/single/alternatives', {
      into: 'competence',
      outlet: 'mainRight'
    });
  }

  resetController(controller) {
    controller.rightMaximized = false;
  }

}
