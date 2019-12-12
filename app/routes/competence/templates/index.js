import Route from '@ember/routing/route';

export default Route.extend({
  setupController() {
    this._super(...arguments);
    const competenceController = this.controllerFor('competence');
    competenceController.set('section', 'challenges');
    competenceController.set('firstMaximized', false);
    if (competenceController.get('view') === null) {
      competenceController.set('view', 'production');
    }
  }
});
