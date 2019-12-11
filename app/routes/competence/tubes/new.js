import Tube from './index';

export default Tube.extend({
  templateName: "competence/tube/index",
  model() {
    return this.get("store").createRecord("tube");
  },
  setupController(controller) {
    this._super(...arguments);
    controller.set('competence', this.modelFor('competence'));
    controller.send("edit");
  }
});
