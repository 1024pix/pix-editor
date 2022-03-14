import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AuthenticatedRoute extends Route {
  @service auth;
  @service router;

  beforeModel() {
    if (!this.auth.connected) {
      this.router.transitionTo('');
    }
  }
}
