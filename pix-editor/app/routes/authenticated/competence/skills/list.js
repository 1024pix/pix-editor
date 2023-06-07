import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CompetenceSkillsListRoute extends Route {

  @service store;

  async model(params) {
    const tube = await this.store.findRecord('tube', params.tube_id);
    const intLevel = parseInt(params.level);
    return { tube, sortedSkills: tube.filledSkills[intLevel - 1] };
  }

  setupController() {
    super.setupController(...arguments);
    const competenceController = this.controllerFor('authenticated.competence');
    competenceController.setSection('skills');
    competenceController.setView('workbench');
  }
}
