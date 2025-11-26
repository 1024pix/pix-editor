import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class SingleRoute extends Route {
  @service currentData;
  @service router;
  @service store;

  async model(params) {
    const skill = await this.store.findRecord('skill', params.skill_id);
    return skill;
  }

  async afterModel(model) {
    await model.challenges;
    if (model.prototypes.length > 0) {
      this.currentData.setPrototype(model.prototypes[0]);
    }
    return model.pinRelationships();
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.edition = false;
    const competenceController = this.controllerFor('authenticated.competence');
    competenceController.setSection('skills');
    if (model.isActive) {
      competenceController.setView('production');
    }
    if (!model.isActive && competenceController.view !== 'draft') {
      competenceController.setView('workbench');
    }
  }

  @action
  async willTransition(transition) {
    const controller = this.controllerFor(transition.from.name);
    if (controller.edition
      && !confirm('Êtes-vous sûr de vouloir abandonner la modification en cours ?')) {
      transition.abort();
    } else {
      const modelSkillSingle = controller.model;
      if (modelSkillSingle && !modelSkillSingle.isNew) {
        modelSkillSingle.rollbackAttributes();
      }
      if (transition.targetName === 'authenticated.competence.prototypes.index') {
        const skill = controller.skill;
        const prototype = this.currentData.getPrototype();
        if (prototype) {
          return this.router.transitionTo('authenticated.competence.prototypes.single', prototype);
        } else {
          const tube = skill.tube;
          return this.router.transitionTo('authenticated.competence.prototypes.list', tube.get('id'), skill.id);
        }
      } else if (transition.targetName === 'authenticated.competence.quality.index' && controller.skill.productionPrototype) {
        return this.router.transitionTo('authenticated.competence.quality.single', controller.skill);
      }

      return true;
    }
  }
}
