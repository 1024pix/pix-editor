import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import AuthenticatedRoute from '../../../../authenticated';

export default class SingleRoute extends AuthenticatedRoute {

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
    if (this.controllerFor('competence.prototypes.single.alternatives.single').edition) {
      if (confirm('Êtes-vous sûr de vouloir abandonner la modification en cours ?')) {
        this.controllerFor('competence.prototypes.single.alternatives.single').send('cancelEdit');
        return true;
      } else {
        transition.abort();
      }
    }
  }

  templateName = 'competence/prototypes/single';
}
