import Skill from './single';

export default Skill.extend({
  templateName: "competence/skills/single",
  model() {
    return {
      skill:this.get("store").createRecord("skill",{status:'en construction'})
    };
  },
  afterModel(model) {
    let params = this.paramsFor(this.routeName);
    return this.get('store').findRecord('tube', params.tube_id)
    .then((tube) => {
      let level = parseInt(params.level)+1;
      model.skill.set('name', tube.get('name')+level);
      model.skill.set('level', level);
      model.tube = tube;
    });
  },
  setupController(controller) {
    this._super(...arguments);
    controller.send('edit');
  }
});
