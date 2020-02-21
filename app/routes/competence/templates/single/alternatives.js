import classic from 'ember-classic-decorator';
import Route from '@ember/routing/route';

@classic
export default class AlternativesRoute extends Route {

  setupController(controller) {
    super.setupController(...arguments);
    let challenge = this.modelFor('competence.templates.single');
    controller.set('challenge', challenge);
    let competence = this.modelFor('competence');
    controller.set('competence', competence);
    controller.set('childComponentMaximized', false);
  }

  renderTemplate() {
    this.render('competence/templates/single/alternatives', {
      into: 'competence',
      outlet: 'mainRight'
    })
  }
}
