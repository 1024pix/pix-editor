import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import AuthenticatedRoute from '../authenticated';

export default class CompetenceManagementSingleRoute extends AuthenticatedRoute {

  @service currentData;
  @service store;

  model(params) {
    return this.store.findRecord('competence', params.competence_id);
  }

  async afterModel(model) {
    if (model) {
      const area = await model.area;
      const framework = await area.framework;
      this.currentData.setFramework(framework);
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
