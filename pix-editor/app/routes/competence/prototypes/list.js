import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class ListRoute extends Route {

  model(params) {
    return this.store.findRecord('tube', params.tube_id)
      .then(tube => {
        return tube.liveSkills;
      })
      .then(liveSkills => {
        const liveSkillsFiltered = liveSkills.filter(skill => skill.level === parseInt(params.level));
        const activeSkill = liveSkillsFiltered.find(skill=>skill.isActive);
        const draftSkills = liveSkillsFiltered.filter(skill=>!skill.isActive);

        return {
          activeSkill,
          draftSkills: draftSkills.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        };
      });
  }

  setupController() {
    super.setupController(...arguments);
    const competenceController = this.controllerFor('competence');
    competenceController.setSection('challenges');
    competenceController.setView('workbench');
    competenceController.maximizeLeft(false);
  }

  @action
  willTransition(transition) {
    if (transition.targetName === 'competence.skills.index') {
      return this.transitionTo('competence.skills.single', this.controllerFor('competence').model, this.controllerFor('competence.prototypes.list').model);
    } else if (transition.targetName === 'competence.quality.index' && this.controllerFor('competence.prototypes.list').model.productionPrototype) {
      return this.transitionTo('competence.quality.single', this.controllerFor('competence').model, this.controllerFor('competence.prototypes.list').model);
    }
    return true;
  }
}
