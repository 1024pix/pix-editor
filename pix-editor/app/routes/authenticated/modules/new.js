import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class NewModuleRoute extends Route {
  @service store;

  async model(params) {
    if (!params.moduleId) return {};
    const module = await this.store.findRecord('module', params.moduleId, { reload: true });
    return { module };
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('moduleId', undefined);
    }
  }
}
