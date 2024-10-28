import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class WhitelistedUrlRoute extends Route {
  @service store;

  async model(params) {
    const whitelistedUrls = await this.store.findAll('whitelisted-url', params.whitelisted_url);
    return whitelistedUrls.find((whitelistedUrl) => whitelistedUrl.id === params.whitelisted_url_id);
  }
}
