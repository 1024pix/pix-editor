import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class SingleRoute extends Route {
  model(params) {
    return this.store.findRecord('challenge', params.alternative_id);
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.edition = false;
  }

  @action
  willTransition(transition) {
    if (this.controller.edition) {
      if (confirm('Êtes-vous sûr de vouloir abandonner la modification en cours ?')) {
        this.controller.send('cancelEdit');
        return true;
      } else {
        transition.abort();
      }
    }
  }

  templateName = 'competence/templates/single';
}
