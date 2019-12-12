import Tube from './single';

export default Tube.extend({
  templateName: "competence/tubes/single",
  model() {
    return this.get("store").createRecord("tube");
  },
  setupController(controller) {
    this._super(...arguments);
    controller.set('competence', this.modelFor('competence'));
    controller.send("edit");
  }
});
