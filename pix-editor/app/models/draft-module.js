import { belongsTo } from '@ember-data/model';

import BaseModule from './base-module';

export default class DraftModule extends BaseModule {
  @belongsTo('module', { inverse: null, async: true }) module;

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
}
