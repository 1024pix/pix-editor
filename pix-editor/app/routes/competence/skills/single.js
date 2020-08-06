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
    if (model.isLive) {
      competenceController.setView('production');
    } else {
      competenceController.setView('history');
    }
  }

  @action
  willTransition(transition) {
    if (this.controller.edition &&
        !confirm('Êtes-vous sûr de vouloir abandonner la modification en cours ?')) {
      transition.abort();
    } else {
      if (this.controller.model.rollbackAttributes) {
        // may not exist if it was a new skill
        this.controller.model.rollbackAttributes();
      }
      if (transition.targetName === 'competence.prototypes.index') {
        const skill = this.controller.skill;
        const prototype = skill.productionPrototype;
        if (prototype) {
          return this.transitionTo('competence.prototypes.single', this.currentData.getCompetence(), prototype);
        } else {
          return this.transitionTo('competence.prototypes.list', this.currentData.getCompetence(), skill);
        }
      } else if (transition.targetName === 'competence.quality.index' && this.controller.skill.productionPrototype) {
        return this.transitionTo('competence.quality.single', this.currentData.getCompetence(), this.controller.skill);
      }

      return true;
    }
  }
}
