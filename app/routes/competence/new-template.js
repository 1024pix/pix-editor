import Challenge from './challenge';

export default Challenge.extend({
  templateName: "competence/challenge",
  model(params) {
    if (params.from) {
      return this.get("store").findRecord("challenge",params.from)
      .then((template) => {
        return template.clone();
      });
    } else {
      return this.get("store").createRecord("challenge", {competence:[this.modelFor("competence").competence.id], status:"proposé", t1:true, t2:true, t3:true, genealogy:"Prototype 1"});
    }
  },
  setupController(controller, model) {
    this._super(controller, model);
    controller.send("edit");
  }
});
