import Route from '@ember/routing/route';

export default Route.extend({
  setupController(controller) {
    this.controllerFor("competence").set("twoColumns", true);
    controller.set("challenge", this.modelFor("competence.challenge"));
  },
  renderTemplate() {
    this.render('competence/challenge/alternatives', {
      into: 'competence',
      outlet: 'mainRight'
    })
  }
});
