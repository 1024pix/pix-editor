import Route from '@ember/routing/route';

export default class SkillRoute extends Route {
  model(params) {
    return this.store.query('skill', {filterByFormula:`FIND('${params.skill_name}', {Nom})`, maxRecords:1});
  }

  afterModel(model) {
    if (model.length > 0) {
      let skill = model.firstObject;
      this.transitionTo('competence.skills.single', skill.competence[0], skill.id);
    } else {
      // redirect to home page
      this.transitionTo('index');
    }
  }
}
