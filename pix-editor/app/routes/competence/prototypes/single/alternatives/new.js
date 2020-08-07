import Route from '@ember/routing/route';

export default class NewRoute extends Route {
  templateName = 'competence/prototypes/single';

  model(params) {
    if (params.from) {
      return this.store.findRecord('challenge',params.from)
        .then(challenge => {
          return challenge.clone();
        });
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
