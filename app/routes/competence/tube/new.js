import Route from '@ember/routing/route';

export default Route.extend({
  templateName: "competence/tube/index",
  model() {
    return this.get("store").createRecord("tube");
  },
  setupController(controller) {
    this._super(...arguments);
    controller.set('competence', this.modelFor('competence'));
    controller.send("edit");
  }
});
