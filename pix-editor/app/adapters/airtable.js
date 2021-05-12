import RESTAdapter from '@ember-data/adapter/rest';
import { inject as service } from '@ember/service';

const ID_PERSISTANT_FIELD = 'id persistant';

export default class AirtableAdapter extends RESTAdapter {

  namespace = '/api/airtable/content';

  @service auth;
  @service config;
  @service ajaxQueue;

  get headers() {
    const headers = {};
    const apiKey = this.auth.key;
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }
    return headers;
  }

  findRecord(store, type, id, snapshot) {
    const serializer = store.serializerFor(type.modelName);
    if (serializer.primaryKey === ID_PERSISTANT_FIELD) {
      const url = this.buildURL(type.modelName, id, snapshot, 'findMany');
      return this.ajax(url, 'GET', { data: {
        filterByFormula:`AND(FIND('${id}', {id persistant}))`,
        maxRecords: 1,
      } });
    }
    return super.findRecord(store, type, id, snapshot);
  }

  // from RESTAdpater, overriden to use PATCH instead of PUT
  updateRecord(store, type, snapshot) {
    const data = {};
    const serializer = store.serializerFor(type.modelName);

    serializer.serializeIntoHash(data, type, snapshot);

    const id = serializer.primaryKey === ID_PERSISTANT_FIELD ? snapshot.attributes().airtableId : snapshot.id;
    const url = this.buildURL(type.modelName, id, snapshot, 'updateRecord');

    return this.ajax(url, id ? 'PATCH' : 'POST', { data: data });
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
    const serializer = store.serializerFor(type.modelName);
    const recordsText = 'OR(' + ids.map(id => `{${serializer.primaryKey}} = '${id}'`).join(',') + ')';
    const url = this.buildURL(type.modelName, ids, snapshots, 'findMany');
    return this.ajax(url, 'GET', { data: { filterByFormula: recordsText } });
  }

  ajax() {
    return this.ajaxQueue.add(() => super.ajax(...arguments));
  }
}
