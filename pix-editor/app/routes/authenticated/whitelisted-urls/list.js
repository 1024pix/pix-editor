import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class StaticCoursesRoute extends Route {
  queryParams = {
    url: {
      refreshModel: true,
    },
    ids: {
      refreshModel: true,
    },
  };

  @service store;
  @service access;

  async model(params) {
    const whitelistedUrls = await this.store.findAll('whitelisted-url', { reload: true });
    const filteredWhitelistedUrls = whitelistedUrls.filter((whitelistedUrl) => {
      const hasMatchingUrl = whitelistedUrl.url.includes(params.url ?? '');
      let hasMatchingIds = true;
      if (params.ids) {
        hasMatchingIds = whitelistedUrl.relatedEntityIds?.includes(params.ids) ?? false;
      }
      return hasMatchingUrl && hasMatchingIds;
    });
    return {
      whitelistedUrls: filteredWhitelistedUrls,
      mayCreateWhitelistedUrl: this.access.mayCreateOrEditWhitelistedUrl(),
    };
  }

  setupController(controller) {
    super.setupController(...arguments);
    if (controller.url) {
      controller.searchUrl = controller.url;
    }
    if (controller.ids) {
      controller.searchIds = controller.ids;
    }
  }
}
