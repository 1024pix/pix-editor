import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class ListRoute extends Route {

  model(params) {
    return this.store.findRecord('skill', params.skill_id);
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
      return this.transitionTo('competence.skills.single', this.controllerFor('competence').model, this.controller.model);
    } else if (transition.targetName === 'competence.quality.index' && this.controller.model.productionTemplate) {
      return this.transitionTo('competence.quality.single', this.controllerFor('competence').model, this.controller.model);
    }
    return true;
  }
}
