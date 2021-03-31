import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class SingleRoute extends Route {

  @service
  currentData;

  model(params) {
    return this.store.findRecord('skill', params.skill_id);
  }

  afterModel(model) {
    return model.pinRelationships();
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.edition = false;
    const competenceController = this.controllerFor('competence');
    competenceController.setSection('skills');
    if (model.isActive) {
      competenceController.setView('production');
    } else {
      competenceController.setView('workbench');
    }
  }

  @action
  willTransition(transition) {
    if (this.controllerFor('competence.skills.single').edition &&
      !confirm('Êtes-vous sûr de vouloir abandonner la modification en cours ?')) {
      transition.abort();
    } else {
      const modelSkillSingle = this.controllerFor('competence.skills.single').model;
      if (modelSkillSingle && modelSkillSingle.rollbackAttributes) {
        // may not exist if it was a new skill
        modelSkillSingle.rollbackAttributes();
      }
      if (transition.targetName === 'competence.prototypes.index') {
        if (this.controllerFor('competence').view === 'workbench') {
          return true;
        }
        const skill = this.controllerFor('competence.skills.single').skill;
        const prototype = skill.productionPrototype;
        if (prototype) {
          return this.transitionTo('competence.prototypes.single', prototype);
        } else {
          const tube = skill.tube;
          return this.transitionTo('competence.prototypes.list', tube.get('id'), skill.id);
        }
      } else if (transition.targetName === 'competence.quality.index' && this.controllerFor('competence.skills.single').skill.productionPrototype) {
        return this.transitionTo('competence.quality.single', this.controllerFor('competence.skills.single').skill);
      }

      return true;
    }
  }
}
