import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ProductionModuleRoute extends Route {
  @service store;

  async model(params, { from }) {
    const module = await this.store.findRecord('module', params.module_id, { reload: true });
    const fromRoute = from?.name ?? 'authenticated.modules.production';
    return { module, fromRoute };
  }
}
