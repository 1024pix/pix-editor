import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class CompetenceManagementSingleRoute extends Route {

  @service currentData;

  model(params) {
    return this.store.findRecord('competence', params.competence_id);
  }

  afterModel(model) {
    if (model) {
      this.currentData.setSource(model.source);
    }
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.edition = false;
  }

  @action
  willTransition(transition) {
    const controller = this.controllerFor('competence-management.single');
    if (controller.edition &&
      !confirm('Êtes-vous sûr de vouloir abandonner la modification en cours ?')) {
      transition.abort();
    } else if (controller.edition) {
      controller.model.rollbackAttributes();
      return true;
    } else {
      return true;
    }
  }
}
