import Route from '@ember/routing/route';

export default Route.extend({
  setupController() {
    this._super(...arguments);
    this.controllerFor('competence').set('section', 'skills');
  }
});
