import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class WhitelistedUrlsRoute extends Route {
  @service access;
  @service router;

  beforeModel() {
    if (!this.access.mayAccessWhitelistedUrls()) {
      this.router.transitionTo('authenticated');
    }
  }
}
