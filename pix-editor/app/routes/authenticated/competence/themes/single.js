import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class CompetenceThemesSingleRoute extends Route {

  @service store;

  model(params) {
    return this.store.findRecord('theme', params.theme_id);
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.edition = false;
    const competenceController = this.controllerFor('authenticated.competence');
    competenceController.setSection('skills');
  }

  @action
  willTransition(transition) {
    const controller = this.controllerFor('authenticated.competence.tubes.single');
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
