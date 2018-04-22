import Route from '@ember/routing/route';

export default Route.extend({
  templateName: "competence/challenge",
  model(params) {
    let alternativeIndex = this.modelFor("competence/challenge").get("nextComputedIndex");
    if (params.from) {
      return this.get("store").findRecord("workbenchChallenge",params.from)
      .then((template) => {
        let model = template.clone();
        model.set("alternativeIndex", alternativeIndex.toString());
        return model;
      });
    } else {
      return this.get("store").createRecord("workbenchChallenge", {competence:[this.modelFor("competence").competence.id], status:"proposé", t1:true, t2:true, t3:true, genealogy:"Dérivé 1", alternativeIndex:alternativeIndex.toString()});
    }
  },
  setupController(controller, model) {
    this._super(controller, model);
    controller.set("competence", this.modelFor("competence"));
    controller.set("template", this.modelFor("competence/challenge"));
    controller.send("edit");
  },
  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('from', "");
    }
  }
});
