import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ProductionModuleRoute extends Route {
  @service store;

  async model(params) {
    const module = await this.store.findRecord('module', params.module_id, { reload: true });
    return { module };
  }
}
