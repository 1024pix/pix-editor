import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    return this.get('store').findRecord('challenge', params.template_id);
  },
  setupController(controller, model) {
    this._super(...arguments);
    controller.set('edition', false);
    controller.set('areas', this.modelFor('application'));
    controller.set('competence', this.modelFor('competence'));
    const competenceController = this.controllerFor('competence');
    competenceController.set('section', 'challenges');
    if (!model.get('isValidated')) {
      competenceController.set('view', 'workbench');
      if (model.get('isWorkbench')) {
        competenceController.set('view', 'workbench-list');
      }
    } else {
      competenceController.set('view', 'production');
    }
  },
  actions: {
    willTransition(transition) {
      if (this.controller.get('edition')) {
        if (confirm('Êtes-vous sûr de vouloir abandonner la modification en cours ?')) {
          this.controller.send('cancelEdit');
          return true;
        } else {
          transition.abort();
        }
      } else {
        if (transition.targetName === 'competence.skills.index') {
          const challenge = this.controller.get('challenge');
          if (!challenge.get('isWorkbench')) {
            const skills = challenge.get('skills');
            if (skills.length > 0) {
              return this.transitionTo('competence.skills.single', this.controller.get('competence'), skills.get('firstObject'));
            }
          }
        }
        this.controller.set("edition", false);
        return true;
      }
    }
  }
});
