import ApplicationAdapter from './application';

export default class ModuleAdapter extends ApplicationAdapter {
  queryRecord(store, type, query, options) {
    if (options.adapterOptions?.publish) {
      const url = `${this.buildURL('draft-module', query.draftModuleId)}/publish`;
      return this.ajax(url, 'POST');
    }
    return super.queryRecord(store, type, query, options);
  }
}
