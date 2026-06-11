import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class DraftModuleRoute extends Route {
  @service store;

  async model(params, { from }) {
    const draftModule = await this.store.findRecord('draft-module', params.draft_module_id, { reload: true });

    let draftModuleDiff;
    if (draftModule.isEditionDraft) {
      draftModuleDiff = await draftModule.diff;
    }

    const fromRoute = from?.name ?? 'authenticated.modules.workbench';

    return { draftModule, draftModuleDiff, fromRoute };
  }
}
