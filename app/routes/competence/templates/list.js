import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import Route from '@ember/routing/route';

@classic
export default class ListRoute extends Route {
  model(params) {
    return this.get('store').findRecord('skill', params.skill_id);
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.set('competence', this.modelFor('competence'));
    const competenceController = this.controllerFor('competence');
    competenceController.set('section', 'challenges');
    competenceController.set('view', 'workbench');
    competenceController.set('firstMaximized', false);
  }

  @action
  willTransition(transition) {
    if (transition.targetName === 'competence.skills.index') {
      return this.transitionTo('competence.skills.single', this.controllerFor('competence').get('model'), this.controller.get('model'));
    } else if (transition.targetName === 'competence.quality.index' && this.controller.get('model.productionTemplate')) {
      return this.transitionTo('competence.quality.single', this.controllerFor('competence').get('model'), this.controller.get('model'));
    }
    return true;
  }
}
