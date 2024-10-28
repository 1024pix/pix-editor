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
    const whitelistedUrls = this.modelFor('authenticated.whitelisted-urls.list');
    const whitelistedUrl = this.modelFor('authenticated.whitelisted-urls.whitelisted-url');
    return { whitelistedUrl, whitelistedUrls };
  }

  afterModel(model) {
    if (!model.whitelistedUrl) {
      this.router.transitionTo('authenticated.whitelisted-urls.list', model.whitelistedUrls);
    }
  }
}
