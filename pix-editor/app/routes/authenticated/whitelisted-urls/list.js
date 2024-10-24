import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class StaticCoursesRoute extends Route {
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

  async model(params) {
    const whitelistedUrls = await this.store.findAll('whitelisted-url', { reload: true });

    const filteredWhitelistedUrls = whitelistedUrls.filter((whitelistedUrl) => {
      const hasMatchingUrl = whitelistedUrl.url.includes(params.url ?? '');
      let hasMatchingNames = true;
      if (params.names) {
        const urlNames = whitelistedUrl.relatedSkillNames ?? [];
        const searchedNames = params.names.split(',');
        hasMatchingNames = searchedNames.some((name) => urlNames.includes(name));
      }
      return hasMatchingUrl && hasMatchingNames;
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
    if (controller.names) {
      controller.searchNames = controller.names;
    }
  }
}
