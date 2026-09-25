import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class WhitelistedUrlNewRoute extends Route {
  @service access;
  @service router;
  @service store;

  beforeModel() {
    if (!this.access.mayCreateOrEditWhitelistedUrl()) {
      this.router.transitionTo('authenticated.whitelisted-urls.list');
    }
  }

  async model() {
    const whitelistedUrls = await this.store.findAll('whitelisted-url', { reload: true });
    return { whitelistedUrls };
  }

  @action
  willTransition() {
    const controller = this.controllerFor('authenticated.whitelisted-urls.new');
    controller.url = '';
    controller.comment = '';
    controller.skillNames = '';
  }
}
