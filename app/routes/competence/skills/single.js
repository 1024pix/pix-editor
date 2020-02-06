import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import Route from '@ember/routing/route';

@classic
export default class SingleRoute extends Route {
  model(params) {
    return this.get('store').findRecord('skill', params.skill_id);
  }

  afterModel(model) {
    return model.pinRelationships();
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.set('edition', false);
    controller.set('areas', this.modelFor('application'));
    controller.set('competence', this.modelFor('competence'));
    const competenceController = this.controllerFor('competence');
    competenceController.set('section', 'skills');
    competenceController.set('view', null);
  }

  @action
  willTransition(transition) {
    if (this.controller.get('edition') &&
        !confirm('Êtes-vous sûr de vouloir abandonner la modification en cours ?')) {
      transition.abort();
    } else {
      this.controller.get('model').rollbackAttributes();
      if (transition.targetName === 'competence.templates.index') {
        const skill = this.controller.get('skill');
        const template = skill.get('productionTemplate');
        if (template) {
          return this.transitionTo('competence.templates.single', this.controller.get('competence'), template);
        } else {
          return this.transitionTo('competence.templates.list', this.controller.get('competence'), skill);
        }
      } else if (transition.targetName === 'competence.quality.index' && this.controller.get('skill.productionTemplate')) {
        return this.transitionTo('competence.quality.single', this.controller.get('competence'), this.controller.get('skill'));
      }

      return true;
    }
  }
}
