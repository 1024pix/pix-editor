import RESTAdapter from '@ember-data/adapter/rest';
import { inject as service } from '@ember/service';

export default class AirtableAdapter extends RESTAdapter {

  namespace = '/api/airtable/content';

  @service config;
  @service ajaxQueue;

  get headers() {
    const headers = {};
    const apiKey = localStorage.getItem('pix-api-key');
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }
    return headers;
  }

  // from RESTAdpater, overriden to use PATCH instead of PUT
  updateRecord(store, type, snapshot) {
    const data = {};
    const serializer = store.serializerFor(type.modelName);

    serializer.serializeIntoHash(data, type, snapshot);

    const id = snapshot.id;
    const url = this.buildURL(type.modelName, id, snapshot, 'updateRecord');

    return this.ajax(url, 'PATCH', { data: data });
  }

  coalesceFindRequests = true;

  groupRecordsForFindMany(store, snapshots) {
    const groups = [];
    for (let i = 0; i < snapshots.length; i += 100) {
      groups.push(snapshots.slice(i, i + 100));
    }
    return groups;
  }

  findMany(store, type, ids, snapshots) {
    const recordsText = 'OR(' + ids.map(id => `RECORD_ID() = '${id}'`).join(',') + ')';
    const url = this.buildURL(type.modelName, ids, snapshots, 'findMany');
    return this.ajax(url, 'GET', { data: { filterByFormula: recordsText } });
  }

  ajax() {
    return this.ajaxQueue.add(() => super.ajax(...arguments));
  }
}
