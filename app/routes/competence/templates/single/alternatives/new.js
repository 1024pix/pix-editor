import Route from '@ember/routing/route';

export default Route.extend({
  templateName: "competence/templates/single",
  model(params) {
    if (params.from) {
      return this.get("store").findRecord("challenge",params.from)
      .then(challenge => {
        return challenge.clone();
      })
    } else {
      let template = this.modelFor("competence/template");
      return template.derive();
    }
  },
  setupController(controller) {
    this._super(...arguments);
    controller.set("competence", this.modelFor("competence"));
    controller.set("template", this.modelFor("competence/templates/single"));
    controller.send("edit");
  },
  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('from', "");
    }
  }
});
