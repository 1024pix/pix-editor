import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class SingleRoute extends Route {

  @service store;
  model(params) {
    return this.store.findRecord('challenge', params.alternative_id);
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.edition = false;
  }

  @action
  willTransition(transition) {
    if (this.controllerFor('authenticated.competence.prototypes.single.alternatives.single').edition) {
      if (confirm('Êtes-vous sûr de vouloir abandonner la modification en cours ?')) {
        this.controllerFor('authenticated.competence.prototypes.single.alternatives.single').send('cancelEdit');
        return true;
      } else {
        transition.abort();
      }
    }
  }

  templateName = 'authenticated/competence/prototypes/single';
}
