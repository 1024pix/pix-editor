import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    return this.get('store').findRecord('skill', params.skill_id);
  },
  afterModel(model) {
    const section = this.controllerFor('competence').get('section');
    if (section === 'challenges') {
      const template = model.get('productionTemplate');
    if (template) {
        this.transitionTo('competence.templates.single', this.modelFor('competence'), template);
      } else {
        this.transitionTo('competence.templates.list', this.modelFor('competence'), model);
      }
    } else {
      return model.pinRelationships();
    }
  },
  setupController(controller) {
    this._super(...arguments);
    controller.set('maximized', false);
    controller.set('edition', false);
    controller.set('areas', this.modelFor('application'));
    controller.set('competence', this.modelFor('competence'));
  },
  actions: {
    willTransition(transition) {
      if (this.controller.get('edition') &&
          !confirm('Êtes-vous sûr de vouloir abandonner la modification en cours ?')) {
        transition.abort();
      } else {
        this.controller.get('model').rollbackAttributes();

        return true;
      }
    }
  }
});
