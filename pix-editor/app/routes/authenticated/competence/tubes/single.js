import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class SingleRoute extends Route {

  @service currentData;
  @service store;

  model(params) {
    return this.store.findRecord('tube', params.tube_id);
  }

  afterModel(model) {
    this.currentData.setPrototype(model);
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.edition = false;
    const competenceController = this.controllerFor('authenticated.competence');
    competenceController.setSection('skills');
  }

  @action
  willTransition(transition) {
    if (this.controllerFor('authenticated.competence.tubes.single').edition &&
      !confirm('Êtes-vous sûr de vouloir abandonner la modification en cours ?')) {
      transition.abort();
    } else {
      return true;
    }
  }
}
