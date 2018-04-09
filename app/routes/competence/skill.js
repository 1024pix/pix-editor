import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    return this.get("store").findRecord("skill", params.skill_id);
  },
  setupController(controller, model) {
    this._super(controller, model);
    controller.set("maximized", false);
    controller.set("edition", false);
    this.controllerFor("competence").set("skillMode", true);
    this.controllerFor("competence").set("currentSkill", model);
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
