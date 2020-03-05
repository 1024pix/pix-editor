import Route from '@ember/routing/route';

export default class AlternativesRoute extends Route {

  model() {
    return this.modelFor('competence.templates.single');
  }

  setupController(controller) {
    super.setupController(...arguments);
    let competence = this.modelFor('competence');
    controller.competence = competence;
    controller.childComponentMaximized = false;
  }

  renderTemplate() {
    this.render('competence/templates/single/alternatives', {
      into: 'competence',
      outlet: 'mainRight'
    })
  }

  resetController(controller) {
    controller.rightMaximized = false;
  }

}
