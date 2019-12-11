import Route from '@ember/routing/route';

export default Route.extend({
  setupController() {
    this._super(...arguments);
    this.controllerFor('competence').set('section', 'challenges');
    this.controllerFor('competence').set('view', 'production');
  }
});
