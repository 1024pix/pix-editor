import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class DraftModuleRoute extends Route {
  @service store;

  async model(params) {
    const draftModule = await this.store.findRecord('draft-module', params.draft_module_id, { reload: true });
    return { draftModule };
  }
}
