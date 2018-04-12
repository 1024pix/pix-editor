import Route from '@ember/routing/route';

export default Route.extend({
  setupController(controller) {
    this._super(controller);
    let challenge = this.modelFor("competence.challenge");
    controller.set("challenge", challenge);
    let competence = this.modelFor("competence");
    controller.set("competence", competence);
    let count = 0;
    if (challenge.alternatives) {
      if (challenge.alternatives.production) {
        count+=challenge.alternatives.production.length;
      }
      if (challenge.alternatives.workbench) {
        count+=challenge.alternatives.workbench.length;
      }
    }
    controller.set("challengeCount",count);
  },
  renderTemplate() {
    this.render('competence/challenge/alternatives', {
      into: 'competence',
      outlet: 'mainRight'
    })
  }
});
