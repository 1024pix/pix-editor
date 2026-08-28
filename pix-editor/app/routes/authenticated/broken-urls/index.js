import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class BrokenUrlsIndexRoute extends Route {
  @service router;

  redirect() {
    this.router.transitionTo('authenticated.broken-urls.challenges');
  }
}
