import Route from '@ember/routing/route';

export default class NewRoute extends Route {
  templateName = 'competence/templates/single';

  model(params) {
    if (params.from) {
      return this.store.findRecord('challenge',params.from)
      .then(challenge => {
        return challenge.clone();
      })
    } else {
      let template = this.modelFor('competence/templates/single');
      return template.derive();
    }
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.template = this.modelFor('competence/templates/single');
    controller.send('edit');
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.from = '';
    }
  }
}
