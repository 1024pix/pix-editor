import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class BrokenUrlsChallengesRoute extends Route {
  @service store;

  async model() {
    const challengesBrokenUrls = await this.store.findAll('broken-url', { reload: true }).then(function (brokenUrls) {
      return brokenUrls.filter((url) => url.challenges.length > 0);
    });
    return {
      challengesBrokenUrls,
    };
  }
}
