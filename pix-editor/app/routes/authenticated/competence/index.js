import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CompetenceIndexRoute extends Route {

  @service router;

  redirect() {
    this.router.transitionTo('authenticated.competence.prototypes');
  }
}
