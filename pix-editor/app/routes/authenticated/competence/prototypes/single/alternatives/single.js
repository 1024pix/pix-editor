import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class SingleRoute extends Route {

  @service store;
  templateName = 'authenticated/competence/prototypes/single';

  model(params) {
    return this.store.findRecord('challenge', params.alternative_id);
  }

  async afterModel(model) {
    super.afterModel(...arguments);
    await model.localizedChallenges;
    await model?.files;
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
}
