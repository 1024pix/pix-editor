import Challenge from './challenge';

export default Challenge.extend({
  templateName: "competence/challenge",
  model(params) {
    if (params.from) {
      return this.get("store").findRecord("challenge",params.from)
      .then((template) => {
        let data = template.toJSON({includeId:false});
        data.status = "proposé";
        delete data.pixId;
        if (data.illustration) {
          let illustration = data.illustration[0];
          data.illustration = [{url:illustration.url, filename:illustration.filename}];
        }
        if (data.attachments) {
          data.attachments = data.attachments.map(value => {
            return {url:value.url, filename:value.filename};
          })
        }
        return this.get("store").createRecord("challenge", data);
      });
    } else {
      return this.get("store").createRecord("challenge", {competence:[this.modelFor("competence").competence.id], status:"proposé", t1:true, t2:true, t3:true, genealogy:"Prototype 1"});
    }
  },
  setupController(controller, model) {
    controller.send("edit");
    // required because 'alias' does not seem to work with extended controller
    controller.set("challenge", model);
    this.controllerFor("competence").set("twoColumns", false);
  }
});
