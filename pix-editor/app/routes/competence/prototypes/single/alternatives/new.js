import Route from '@ember/routing/route';

export default class NewRoute extends Route {
  templateName = 'competence/prototypes/single';

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
