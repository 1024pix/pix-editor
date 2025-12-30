import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AdminRoute extends Route {
  @service config;
  @service session;
  @service access;
  @service store;
  @service router;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
    if (transition.isAborted) return;
  }

  async model() {
    await this.config.load();
    const user = await this.store.queryRecord('user', { me: true });

    if (!this.access.mayAccessAdministration()) {
      return { schemas: [], user };
    }

    const schemas = await this.store.findAll('admin-schema');
    return { schemas, user };
  }

  async afterModel() {
    if (!this.access.mayAccessAdministration()) {
      this.router.transitionTo('authenticated');
    }
  }
}
