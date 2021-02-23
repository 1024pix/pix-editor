import Route from '@ember/routing/route';
import { action } from '@ember/object';


export default class CompetenceThemesSingleRoute extends Route {
  model(params) {
    return this.store.findRecord('theme', params.theme_id);
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.edition = false;
    const competenceController = this.controllerFor('competence');
    competenceController.setSection('skills');
    competenceController.setView('workbench');
  }

  @action
  willTransition(transition) {
    const controller = this.controllerFor('competence.tubes.single');
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
