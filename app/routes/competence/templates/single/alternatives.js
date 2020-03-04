import Route from '@ember/routing/route';

export default class AlternativesRoute extends Route {

  setupController(controller) {
    super.setupController(...arguments);
    let challenge = this.modelFor('competence.templates.single');
    controller.challenge = challenge;
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
}
