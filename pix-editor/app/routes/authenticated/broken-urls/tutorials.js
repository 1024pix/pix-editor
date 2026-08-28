import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class BrokenUrlsTutorialsRoute extends Route {
  @service store;

  async model() {
    const tutorialBrokenUrls = await this.store.findAll('broken-url', { reload: true }).then(function (brokenUrls) {
      return brokenUrls.filter((url) => url.tutorials.length > 0);
    });
    return {
      tutorialBrokenUrls,
    };
  }
}
