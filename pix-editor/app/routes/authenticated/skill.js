import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class SkillRoute extends Route {

  @service router;
  @service store;

  async model(params) {
    return this.store.query('skill', { filterByFormula: `FIND('${params.skill_pix_id}', {id persistant})` });
  }

  async afterModel(model) {
    if (model) {
      const skill = model[0];
      const tube = await skill.tube;
      const competence = await tube.competence;
      this.router.transitionTo('authenticated.competence.skills.single', competence.id, skill.id);
    } else {
      // redirect to home page
      this.router.transitionTo('authenticated');
    }
  }
}
