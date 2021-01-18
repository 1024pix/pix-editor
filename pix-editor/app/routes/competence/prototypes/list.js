import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class ListRoute extends Route {

  model(params) {
    return this.store.findRecord('tube', params.tube_id)
      .then(tube => {
        return  this.store.findRecord('skill', params.skill_id).then(skill=>{
          return { liveSkills: tube.liveSkills, skill };
        });
      })
      .then(({ liveSkills, skill }) => {
        const liveSkillsFilteredByLevel = liveSkills.filter(liveSkill => liveSkill.level === parseInt(skill.level));
        const skills = liveSkillsFilteredByLevel.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return { skills, skill };
      });
  }

  afterModel(model) {
    const controllerList = this.controllerFor('competence.prototypes.list');
    controllerList.selectedSkill = model.skill;
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
      return this.transitionTo('competence.skills.single', this.controllerFor('competence').model, this.controllerFor('competence.prototypes.list').model.skill);
    } else if (transition.targetName === 'competence.quality.index' && this.controllerFor('competence.prototypes.list').model.productionPrototype) {
      return this.transitionTo('competence.quality.single', this.controllerFor('competence').model, this.controllerFor('competence.prototypes.list').model.skill);
    }
    return true;
  }
}
