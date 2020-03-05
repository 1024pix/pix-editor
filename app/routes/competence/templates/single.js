import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class SingleRoute extends Route {

  model(params) {
    return this.store.findRecord('challenge', params.template_id);
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.edition = false;
    controller.areas = this.modelFor('application');
    controller.competence = this.modelFor('competence');
    const competenceController = this.controllerFor('competence');
    competenceController.setSection('challenges');
    if (!model.isValidated) {
      if (model.isWorkbench) {
        competenceController.setView('workbench-list');
      } else {
        competenceController.setView('workbench');
      }
    } else {
      competenceController.setView('production');
    }
  }

  @action
  willTransition(transition) {
    if (this.controller.edition) {
      if (confirm('Êtes-vous sûr de vouloir abandonner la modification en cours ?')) {
        this.controller.send('cancelEdit');
        return true;
      } else {
        transition.abort();
      }
    } else {
      if (transition.targetName === 'competence.skills.index' || transition.targetName === 'competence.quality.index') {
        const challenge = this.controller.challenge;
        if (!challenge.isWorkbench) {
          const skills = challenge.skills;
          const skill = skills.firstObject;
          if (skill) {
            if (transition.targetName === 'competence.quality.index' && skill.productionTemplate) {
              return this.transitionTo('competence.quality.single', this.controller.competence, skill);
            } else if (transition.targetName === 'competence.skills.index') {
              return this.transitionTo('competence.skills.single', this.controller.competence, skill);
            }
          }
        }
      }
      this.controller.edition = false;
      return true;
    }
  }
}
