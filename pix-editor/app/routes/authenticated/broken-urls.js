import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class BrokenUrlsRoute extends Route {
  @service access;
  @service router;
  @service store;

  beforeModel() {
    if (!this.access.mayAccessBrokenUrls()) {
      this.router.transitionTo('authenticated');
    }
  }

  async model() {
    const brokenUrls = await this.store.findAll('broken-url', { reload: true });
    await Promise.all(brokenUrls.flatMap((brokenUrl) => [brokenUrl.skills, brokenUrl.localizedChallenges]));

    return {
      brokenUrls,
    };
  }
}
