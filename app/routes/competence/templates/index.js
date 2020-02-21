import classic from 'ember-classic-decorator';
import Route from '@ember/routing/route';

@classic
export default class IndexRoute extends Route {
  setupController() {
    super.setupController(...arguments);
    const competenceController = this.controllerFor('competence');
    competenceController.set('section', 'challenges');
    competenceController.set('firstMaximized', false);
    if (competenceController.get('view') === null) {
      competenceController.set('view', 'production');
    }
  }
}
