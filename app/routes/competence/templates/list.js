import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    return this.get("store").findRecord("skill", params.skill_id);
  },
  setupController(controller) {
    this._super(...arguments);
    let competence = this.modelFor("competence");
    controller.set("competence", competence);
  }
});
