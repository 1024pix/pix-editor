import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    return this.get("store").query("skill", {filterByFormula:"FIND('"+params.skill_name+"', {Nom})", maxRecords:1});
  },
  afterModel(model) {
    if (model.get("length") > 0) {
      let skill = model.get("firstObject");
      this.transitionTo("competence.skills.single", skill.get("competence")[0], skill.get("id"));
    } else {
      // redirect to home page
      this.transitionTo("index");
    }
  }
});
