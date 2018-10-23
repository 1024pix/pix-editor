import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    return this.get("store").findRecord("challenge", params.template_id);
  },
  setupController(controller) {
    this._super(...arguments);
    controller.set("maximized", false);
    controller.set("edition", false);
    controller.set("competence", this.modelFor("competence"));
    controller.send("init");
    /*if (model.template && !model.get("skillNames")) {
      this.controllerFor("competence").set("listView", true);
    }*/
  },
  actions: {
    willTransition(transition) {
      if (this.controller.get("edition")) {
        if (confirm('Êtes-vous sûr de vouloir abandonner la modification en cours ?')) {
          this.controller.send("cancelEdit");
          return true;
        } else {
          transition.abort();
        }
      } else {
        this.controller.set("edition", false);
        return true;
      }
    }
  }
});
