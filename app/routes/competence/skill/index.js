import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    return this.get("store").findRecord("skill", params.skill_id);
  },
  setupController(controller) {
    this._super(...arguments);
    controller.set("maximized", false);
    controller.set("edition", false);
    controller.set("areas", this.modelFor('application'));
    controller.set("competence", this.modelFor('competence'));
    this.controllerFor("competence").set("skillMode", true);
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
