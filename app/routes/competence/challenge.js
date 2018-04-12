import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    return this.get("store").findRecord("challenge", params.challenge_id);
  },
  setupController(controller, model) {
    this._super(controller, model);
    controller.set("maximized", false);
    controller.set("edition", false);
    if (model.template && !model.get("skillNames")) {
      this.controllerFor("competence").set("listView", true);
    }
    //this.controllerFor("competence").set("currentChallenge", model);
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
  }
});
