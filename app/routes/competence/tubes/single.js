import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import Route from '@ember/routing/route';

@classic
export default class SingleRoute extends Route {
  model(params) {
    return this.get('store').findRecord('tube', params.tube_id);
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.set('maximized', false);
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
      return true;
    }
  }
}
