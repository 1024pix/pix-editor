import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ChallengeBrokenUrlsRoute extends Route {
  @service router;
  @service store;

  async redirect() {
    await this.router.transitionTo('authenticated.broken-urls.challenges');
  }
}
