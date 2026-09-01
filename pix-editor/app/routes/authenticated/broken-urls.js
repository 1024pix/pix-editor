import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class BrokenUrlsRoute extends Route {
  @service access;
  @service router;

  beforeModel() {
    if (!this.access.mayAccessBrokenUrls()) {
      this.router.transitionTo('authenticated');
    }
  }
}
