import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ChallengeBrokenUrlsRoute extends Route {
  @service router;
  @service store;

  async model() {
    const { brokenUrls } = await this.modelFor('authenticated.broken-urls');
    const challengeBrokenUrls = brokenUrls.filter((brokenUrl) => brokenUrl.localizedChallenges.content.length > 0);
    await Promise.all(challengeBrokenUrls.map((brokenUrl) => brokenUrl.localizedChallenges));

    return {
      challengeBrokenUrls,
    };
  }
}
