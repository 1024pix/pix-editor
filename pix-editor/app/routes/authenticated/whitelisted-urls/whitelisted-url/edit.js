import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class EditWhitelistedUrlRoute extends Route {
  @service store;
  @service access;
  @service router;

  beforeModel() {
    if (!this.access.mayCreateOrEditWhitelistedUrl()) {
      this.router.transitionTo('authenticated.whitelisted-urls.list');
    }
  }

  async model() {
    const whitelistedUrl = this.modelFor('authenticated.whitelisted-urls.whitelisted-url');
    return { whitelistedUrl };
  }
}
