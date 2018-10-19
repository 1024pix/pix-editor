import Route from '@ember/routing/route';

export default Route.extend({
  templateName: "competence/template",
  model(params) {
    let alternativeIndex = this.modelFor("competence/template").get("nextComputedIndex");
    if (params.from) {
      let templateQuery;
      if (params.workbench) {
        templateQuery = this.get("store").findRecord("workbenchChallenge",params.from);
      } else {
        templateQuery = this.get("store").findRecord("challenge",params.from);
      }
      return templateQuery
      .then((template) => {
        let model = template.clone();
        model.set("alternativeIndex", alternativeIndex.toString());
        return model;
      });
    } else {
      let template = this.modelFor("competence/template");
      let newDerived = template.derive();
      newDerived.set("alternativeIndex", alternativeIndex.toString())
      return newDerived;
    }
  },
  setupController(controller) {
    this._super(...arguments);
    controller.set("competence", this.modelFor("competence"));
    controller.set("template", this.modelFor("competence/template"));
    controller.send("edit");
  },
  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('from', "");
    }
  }
});
