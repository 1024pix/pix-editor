import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class SingleRoute extends Route {
  model(params) {
    return this.store.findRecord('tube', params.tube_id);
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.maximized = false;
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
      return true;
    }
  }
}
