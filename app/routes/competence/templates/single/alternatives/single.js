import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    return this.get("store").findRecord("workbenchChallenge", params.alternative_id)
    .catch(() => {
      // If challenge not found in workbench, try in production
      return this.get("store").findRecord("challenge", params.alternative_id)
    });
  },
  setupController(controller, model) {
    this._super(controller, model);
    controller.set("maximized", false);
    controller.set("edition", false);
    controller.set("competence", this.modelFor("competence"));
  },
  actions: {
    willTransition(transition) {
      if (this.controller.get("edition") &&
          !confirm('Êtes-vous sûr de vouloir abandonner la modification en cours ?')) {
        transition.abort();
      } else {
        return true;
      }
    }
  },
  templateName: "competence/templates/single"
});
