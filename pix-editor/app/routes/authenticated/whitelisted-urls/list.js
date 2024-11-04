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
    };
  }

  setupController(controller) {
    super.setupController(...arguments);
    if (controller.url) {
      controller.searchUrl = controller.url;
    }
    if (controller.names) {
      controller.searchNames = controller.names;
    }
  }
}
