import Challenge from '../../challenge';

export default Challenge.extend({
  model(params) {
    return this.get("store").findRecord("workbenchChallenge", params.alternative_id);
  },
  setupController(controller, model) {
    controller.set("challenge", model);
    this.controllerFor("competence").set("twoColumns", true);
  },
  templateName: "competence/challenge"
});
