import Route from '@ember/routing/route';

export default Route.extend({
 setupController(controller) {
    this._super(controller);
    let challenge = this.modelFor("competence.templates.single");
    controller.set("challenge", challenge);
    let competence = this.modelFor("competence");
    controller.set("competence", competence);
    controller.set("challengeCount",challenge.get("alternativesCount"));
    controller.set("childComponentMaximized", false);
  },
  renderTemplate() {
    this.render('competence/templates/single/alternatives', {
      into: 'competence',
      outlet: 'mainRight'
    })
  }
});
