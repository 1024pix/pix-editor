import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class WhitelistedUrlNewRoute extends Route {
  @service access;
  @service router;
  @service store;

  beforeModel() {
    if (!this.access.mayCreateOrEditWhitelistedUrl()) {
      this.router.transitionTo('authenticated.whitelisted-urls.list');
    }
  }

  async model() {
    const whitelistedUrls = await this.store.findAll('whitelisted-url', { reload: true });
    return { whitelistedUrls };
  }
}
