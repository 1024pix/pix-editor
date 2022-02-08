import AuthenticatedRoute from './authenticated';
import { inject as service } from '@ember/service';

export default class SkillRoute extends AuthenticatedRoute {

  @service router;
  model(params) {
    return this.store.query('skill', { filterByFormula:`FIND('${params.skill_name}', {Nom})`, maxRecords: 1 });
  }

  async afterModel(model) {
    if (model.length > 0) {
      const skill = model.firstObject;
      const tube = await skill.tube;
      const competence = await tube.competence;
      this.router.transitionTo('competence.skills.single', competence.id, skill.id);
    } else {
      // redirect to home page
      this.router.transitionTo('index');
    }
  }
}
