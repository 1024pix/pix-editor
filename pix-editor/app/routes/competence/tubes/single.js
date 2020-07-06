import Route from '@ember/routing/route';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';

export default class SingleRoute extends Route {

  @service currentData;

  model(params) {
    return this.store.findRecord('tube', params.tube_id);
  }

  afterModel(model) {
    this.currentData.setTemplate(model);
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.edition = false;
    const competenceController = this.controllerFor('competence');
    competenceController.setSection('skills');
    competenceController.setView(null);
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
