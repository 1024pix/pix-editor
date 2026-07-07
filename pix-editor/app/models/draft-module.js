import { belongsTo } from '@ember-data/model';

import BaseModule from './base-module';

export default class DraftModule extends BaseModule {
  @belongsTo('module', { inverse: 'draftModule', async: true }) module;
  @belongsTo('draft-module-diff', { inverse: null, async: true }) diff;

  get isDraft() {
    return true;
  }

  get moduleId() {
    return this.belongsTo('module').id();
  }

  get belongsToModule() {
    return !!this.moduleId;
  }

  get isEditionDraft() {
    return this.belongsToModule;
  }

  async publish() {
    const module = await this.store.queryRecord(
      'module',
      { draftModuleId: this.id },
      { adapterOptions: { publish: true } },
    );
    this.store.unloadRecord(this);
    return module;
  }
}
