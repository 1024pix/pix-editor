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
      if (transition.targetName === 'competence.templates.index') {
        const skill = this.controller.skill;
        const template = skill.productionTemplate;
        if (template) {
          return this.transitionTo('competence.templates.single', this.currentData.getCompetence(), template);
        } else {
          return this.transitionTo('competence.templates.list', this.currentData.getCompetence(), skill);
        }
      } else if (transition.targetName === 'competence.quality.index' && this.controller.skill.productionTemplate) {
        return this.transitionTo('competence.quality.single', this.currentData.getCompetence(), this.controller.skill);
      }

      return true;
    }
  }
}
