import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    return this.get('store').findRecord('tube', params.tube_id);
  },
  setupController(controller) {
    this._super(...arguments);
    controller.set('maximized', false);
    controller.set('edition', false);
    controller.set('areas', this.modelFor('application'));
    controller.set('competence', this.modelFor('competence'));
    this.controllerFor('competence').set('view', 'skills');
  }
});
