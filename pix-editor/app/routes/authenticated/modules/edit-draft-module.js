import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class EditDraftModuleRoute extends Route {
  @service store;
  @service access;
  @service router;

  async beforeModel() {
    if (!this.access.mayCreateOrEditModule()) {
      this.router.transitionTo('authenticated.modules.production');
    }
  }

  async model(params) {
    const draftModule = await this.store.findRecord('draft-module', params.draft_module_id, { reload: true });
    return { draftModule };
  }
}
