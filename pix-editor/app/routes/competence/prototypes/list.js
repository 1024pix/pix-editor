import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class ListRoute extends Route {

  async model(params) {
    const tube = await this.store.findRecord('tube', params.tube_id);
    const skill = await this.store.findRecord('skill', params.skill_id);
    return { skills: tube.filledSkills[skill.level - 1], skill };
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.selectedSkill = model.skill;
    const competenceController = this.controllerFor('competence');
    competenceController.setSection('challenges');
    competenceController.setView('workbench');
    competenceController.maximizeLeft(false);
  }

  @action
  willTransition(transition) {
    if (transition.targetName === 'competence.skills.index') {
      return this.transitionTo('competence.skills.single', this.controllerFor('competence').model, this.controllerFor('competence.prototypes.list').selectedSkill);
    } else if (transition.targetName === 'competence.quality.index' && this.controllerFor('competence.prototypes.list').selectedSkill.productionPrototype) {
      return this.transitionTo('competence.quality.single', this.controllerFor('competence').model, this.controllerFor('competence.prototypes.list').selectedSkill);
    }
    return true;
  }
}
