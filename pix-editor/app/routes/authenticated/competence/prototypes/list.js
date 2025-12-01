import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ListRoute extends Route {
  @service router;
  @service store;

  async model(params) {
    const [tube, skill] = await Promise.all([
      this.store.findRecord('tube', params.tube_id),
      this.store.findRecord('skill', params.skill_id),
    ]);
    const skills = await tube.rawSkills;
    await Promise.all(skills.map((skill) => skill.challenges));
    return { skills: tube.filledSkills[skill.level - 1], skill };
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.selectedSkill = model.skill;
    const competenceController = this.controllerFor('authenticated.competence');
    competenceController.setSection('challenges');
    competenceController.setView('workbench');
    competenceController.maximizeLeft(false);
  }

  @action
  willTransition(transition) {
    if (transition.targetName === 'authenticated.competence.skills.index') {
      return this.router.transitionTo(
        'authenticated.competence.skills.single',
        this.controllerFor('authenticated.competence').model,
        this.controllerFor('authenticated.competence.prototypes.list').selectedSkill,
      );
    } else if (
      transition.targetName === 'authenticated.competence.quality.index' &&
      this.controllerFor('authenticated.competence.prototypes.list').selectedSkill.productionPrototype
    ) {
      return this.router.transitionTo(
        'authenticated.competence.quality.single',
        this.controllerFor('authenticated.competence').model,
        this.controllerFor('authenticated.competence.prototypes.list').selectedSkill,
      );
    }
    return true;
  }
}
