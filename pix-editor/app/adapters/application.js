import { inject as service } from '@ember/service';
import JSONAPIAdapter from '@ember-data/adapter/json-api';

const FIND_GROUP_SIZE = 200;

export default class ApplicationAdapter extends JSONAPIAdapter {
  @service session;
  @service ajaxQueue;

  namespace = 'api';

  get headers() {
    const headers = {};
    const apiKey = this.session.data.authenticated.apiKey;
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }
    return headers;
  }

  // will be used only if this.coalesceFindRequests is true
  groupRecordsForFindMany(store, snapshots) {
    const groups = [];
    for (let i = 0; i < snapshots.length; i += FIND_GROUP_SIZE) {
      groups.push(snapshots.slice(i, i + FIND_GROUP_SIZE));
    }
    return groups;
  }

  async findMany(store, type, ids, snapshots) {
    const url = this.buildURL(type.modelName, ids, snapshots, 'findMany');
    return this.ajax(url, 'GET', { data: { filter: { ids } } });
  }

  ajax(...args) {
    return this.ajaxQueue.add(() => super.ajax(...args));
  }
}
