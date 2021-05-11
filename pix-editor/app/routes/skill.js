import Route from '@ember/routing/route';

export default class SkillRoute extends Route {
  model(params) {
    return this.store.query('skill', { filterByFormula:`FIND('${params.skill_name}', {Nom})`, maxRecords: 1 });
  }

  async afterModel(model) {
    if (model.length > 0) {
      const skill = model.firstObject;
      const tube = await skill.tube;
      const competence = await tube.competence;
      this.transitionTo('competence.skills.single', competence.id, skill.id);
    } else {
      // redirect to home page
      this.transitionTo('index');
    }
  }
}
