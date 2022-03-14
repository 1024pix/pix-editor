import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import AuthenticatedRoute from '../../authenticated';

export default class SingleRoute extends AuthenticatedRoute {

  @service currentData;

  model(params) {
    return this.store.findRecord('tube', params.tube_id);
  }

  afterModel(model) {
    this.currentData.setPrototype(model);
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.edition = false;
    const competenceController = this.controllerFor('competence');
    competenceController.setSection('skills');
  }

  @action
  willTransition(transition) {
    if (this.controllerFor('competence.tubes.single').edition &&
      !confirm('Êtes-vous sûr de vouloir abandonner la modification en cours ?')) {
      transition.abort();
    } else {
      return true;
    }
  }
}
