import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    return this.get('store').findRecord('skill', params.skill_id);
  },
  afterModel(model) {
    return model.pinRelationships();
  },
  setupController(controller) {
    this._super(...arguments);
    controller.set('maximized', false);
    controller.set('edition', false);
    controller.set('areas', this.modelFor('application'));
    controller.set('competence', this.modelFor('competence'));
    this.controllerFor('competence').set('section', 'skills');
  },
  actions: {
    willTransition(transition) {
      if (this.controller.get('edition') &&
          !confirm('Êtes-vous sûr de vouloir abandonner la modification en cours ?')) {
        transition.abort();
      } else {
        this.controller.get('model').rollbackAttributes();
        if (transition.targetName === 'competence.templates.index') {
          const skill = this.controller.get('skill');
          const template = skill.get('productionTemplate');
          if (template) {
            return this.transitionTo('competence.templates.single', this.controller.get('competence'), template);
          }
        }
        return true;
      }
    }
  }
});
