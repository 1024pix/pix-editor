import Template from './single';

export default Template.extend({
  templateName: "competence/templates/single",
  model(params) {
    //TODO: handle "fromSkill" param
    if (params.from) {
      return this.get("store").findRecord("challenge",params.from)
      .then((template) => {
        return template.clone();
      });
    } else {
      return this.get("store").createRecord("workbenchChallenge", {competence:[this.modelFor("competence").id], status:"proposé", t1:true, t2:true, t3:true, genealogy:"Prototype 1"});
    }
  },
  setupController(controller) {
    this._super(...arguments);
    controller.send("edit");
    controller.send("init");
  },
  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('from', "");
    }
  }
});
