import { belongsTo } from '@ember-data/model';

import BaseModule from './base-module';

export default class Module extends BaseModule {
  @belongsTo('draft-module', { inverse: 'module', async: true }) draftModule;

  get draftModuleId() {
    return this.belongsTo('draftModule').id();
  }

  get hasDraft() {
    return !!this.draftModuleId;
  }

  get isDraft() {
    return false;
  }

  get isEditionDraft() {
    return false;
  }
}
