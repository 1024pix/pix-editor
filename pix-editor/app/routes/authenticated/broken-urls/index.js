import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class BrokenUrlsIndexRoute extends Route {
  @service router;
  @service store;

  async model() {
    const brokenUrls = await this.store.findAll('broken-url', { reload: true });

    return {
      brokenUrls,
    };
  }
}
