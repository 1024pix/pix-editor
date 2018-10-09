import Template from './single';

export default Template.extend({
  templateName: "competence/templates/single",
  model(params) {
    if (params.from) {
      return this.get("store").findRecord("challenge",params.from)
      .then((template) => {
        return template.clone();
      });
    } else {
      return this.get("store").createRecord("workbenchChallenge", {competence:[this.modelFor("competence").id], status:"proposé", t1:true, t2:true, t3:true, genealogy:"Prototype 1"});
    }
  },
  setupController(controller, model) {
    this._super(controller, model);
    controller.send("edit");
    controller.send("init");
  },
  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('from', "");
    }
  }
});
