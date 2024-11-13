import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class WhitelistedUrlsRoute extends Route {
  queryParams = {
    url: {
      refreshModel: true,
    },
    names: {
      refreshModel: true,
    },
  };

  @service store;
  @service access;

  async model() {
    const whitelistedUrls = await this.store.findAll('whitelisted-url', { reload: true });
    return {
      whitelistedUrls,
      mayCreateWhitelistedUrl: this.access.mayCreateOrEditWhitelistedUrl(),
    };
  }
}
