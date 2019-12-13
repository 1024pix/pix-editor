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
    const competenceController = this.controllerFor('competence');
    competenceController.set('section', 'skills');
    competenceController.set('view', null);
  },
  actions: {
    willTransition(transition) {
      if (this.controller.get('edition') &&
        !confirm('Êtes-vous sûr de vouloir abandonner la modification en cours ?')) {
        transition.abort();
      } else {
        return true;
      }
    }
  }
});
