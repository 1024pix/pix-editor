import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class NewRoute extends Route {
  templateName = 'authenticated/competence/prototypes/single';

  @service store;

  async model(params) {
    if (params.from) {
      const challenge = await this.store.findRecord('challenge', params.from);
      return challenge.duplicate();
    } else {
      const prototype = this.modelFor('authenticated.competence.prototypes.single');
      return prototype.derive();
    }
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.send('edit');
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.from = '';
    }
  }
}
