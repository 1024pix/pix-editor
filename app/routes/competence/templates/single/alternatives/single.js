import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    return this.get("store").findRecord("challenge", params.alternative_id)
  },
  setupController(controller) {
    this._super(...arguments);
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
