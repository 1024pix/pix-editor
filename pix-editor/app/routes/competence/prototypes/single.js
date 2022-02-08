import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import AuthenticatedRoute from '../../authenticated';

export default class SingleRoute extends AuthenticatedRoute {

  @service currentData
  @service router;

  model(params) {
    return this.store.findRecord('challenge', params.prototype_id);
  }

  async afterModel(model) {
    super.afterModel(...arguments);
    await model.files;
    this.currentData.setPrototype(model);
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.edition = false;
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
    if (this.controllerFor('competence.prototypes.single').edition) {
      if (confirm('Êtes-vous sûr de vouloir abandonner la modification en cours ?')) {
        this.controllerFor('competence.prototypes.single').send('cancelEdit');
        return true;
      } else {
        transition.abort();
      }
    } else {
      if (transition.targetName === 'competence.skills.index' || transition.targetName === 'competence.quality.index') {
        const challenge = this.controllerFor('competence.prototypes.single').model;
        if (!challenge.isWorkbench) {
          const skill = challenge.skill;
          if (skill) {
            if (transition.targetName === 'competence.quality.index' && skill.productionPrototype) {
              return this.router.transitionTo('competence.quality.single', this.currentData.getCompetence(), skill);
            } else if (transition.targetName === 'competence.skills.index') {
              return this.router.transitionTo('competence.skills.single', this.currentData.getCompetence(), skill);
            }
          }
        }
      }
      this.controllerFor('competence.prototypes.single').edition = false;
      return true;
    }
  }
}
