import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    return this.get("store").findRecord("challenge", params.template_id);
  },
  setupController(controller, model) {
    this._super(controller, model);
    controller.set("maximized", false);
    controller.set("edition", false);
    controller.set("competence", this.modelFor("competence"));
    /*if (model.template && !model.get("skillNames")) {
      this.controllerFor("competence").set("listView", true);
    }*/
  },
  actions: {
    willTransition(transition) {
      if (this.controller.get("edition") &&
          !confirm('Êtes-vous sûr de vouloir abandonner la modification en cours ?')) {
        transition.abort();
      } else {
        this.controller.set("edition", false);
        return true;
      }
    }
  }
});
