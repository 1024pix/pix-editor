import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class SingleRoute extends Route {

  model(params) {
    return this.store.findRecord('skill', params.skill_id);
  }

  afterModel(model) {
    return model.pinRelationships();
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.edition = false;
    controller.areas = this.modelFor('application');
    controller.competence = this.modelFor('competence');
    const competenceController = this.controllerFor('competence');
    competenceController.section = 'skills';
    competenceController.view = null;
  }

  @action
  willTransition(transition) {
    if (this.controller.edition &&
        !confirm('Êtes-vous sûr de vouloir abandonner la modification en cours ?')) {
      transition.abort();
    } else {
      this.controller.model.rollbackAttributes();
      if (transition.targetName === 'competence.templates.index') {
        const skill = this.controller.skill;
        const template = skill.productionTemplate;
        if (template) {
          return this.transitionTo('competence.templates.single', this.controller.competence, template);
        } else {
          return this.transitionTo('competence.templates.list', this.controller.competence, skill);
        }
      } else if (transition.targetName === 'competence.quality.index' && this.controller.skill.productionTemplate) {
        return this.transitionTo('competence.quality.single', this.controller.competence, this.controller.skill);
      }

      return true;
    }
  }
}
