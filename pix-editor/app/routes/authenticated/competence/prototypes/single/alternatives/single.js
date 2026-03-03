import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class SingleRoute extends Route {
  @service store;
  templateName = 'authenticated/competence/prototypes/single';

  model(params) {
    return this.store.findRecord('challenge', params.alternative_id);
  }

  async afterModel(model) {
    super.afterModel(...arguments);
    await model.localizedChallenges;
    await model?.attachments;
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.edition = false;
    controller.urlsToConsult = model.urlsToConsult?.join('\n') ?? '';
    controller.invalidUrlsToConsult = '';
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
