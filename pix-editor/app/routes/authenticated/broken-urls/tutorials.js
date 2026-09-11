import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class TutorialBrokenUrlsRoute extends Route {
  @service router;
  @service store;

  async model() {
    const { brokenUrls } = await this.modelFor('authenticated.broken-urls');
    const tutorialBrokenUrls = brokenUrls.filter((brokenUrl) => brokenUrl.skills.content.length > 0);
    await Promise.all(tutorialBrokenUrls.map((brokenUrl) => brokenUrl.skills));

    return {
      tutorialBrokenUrls,
    };
  }
}
