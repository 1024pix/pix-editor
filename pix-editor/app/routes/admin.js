import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AdminRoute extends Route {
  @service config;
  @service session;
  @service access;
  @service store;
  @service router;

  async beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
    if (transition.isAborted) return;

    await this.config.load();
    if (!this.access.mayAccessAdministration()) {
      this.router.transitionTo('authenticated');
    }
  }

  async model() {
    const user = await this.store.queryRecord('user', { me: true });
    const schemas = await this.store.findAll('admin-schema');
    return { schemas, user };
  }
}
