import AuthenticatedRoute from '../../../../authenticated';
import { inject as service } from '@ember/service';

export default class NewRoute extends AuthenticatedRoute {
  templateName = 'competence/prototypes/single';

  @service store;

  async model(params) {
    if (params.from) {
      const challenge = await this.store.findRecord('challenge', params.from);
      return challenge.duplicate();
    } else {
      const prototype = this.modelFor('competence/prototypes/single');
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
