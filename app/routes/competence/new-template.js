import Challenge from './challenge';

export default Challenge.extend({
  templateName: "competence/challenge",
  model() {
    return this.get("store").createRecord("challenge", {competence:[this.modelFor("competence").competence.id], status:"proposé", t1:true, t2:true, t3:true, genealogy:"Prototype 1"});
  },
  setupController(controller, model) {
    controller.send("edit");
    // required because 'alias' does not seem to work with extended controller
    controller.set("challenge", model);
  }
});
