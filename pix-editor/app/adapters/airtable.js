import { inject as service } from '@ember/service';
import RESTAdapter from '@ember-data/adapter/rest';
import chunk from 'lodash/chunk';

const ID_PERSISTANT_FIELD = 'id persistant';

export default class AirtableAdapter extends RESTAdapter {

  namespace = '/api/airtable/changelog';

  @service session;
  @service config;
  @service ajaxQueue;

  get headers() {
    const headers = {};
    const apiKey = this.session.data.authenticated.apiKey;
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
        filterByFormula: `AND(FIND('${id}', {id persistant}))`,
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

    return this.ajax(url, id ? 'PATCH' : 'POST', { data });
  }

  coalesceFindRequests = true;

  groupRecordsForFindMany(_store, snapshots) {
    const groups = [];
    for (let i = 0; i < snapshots.length; i += 100) {
      groups.push(snapshots.slice(i, i + 100));
    }
    return groups;
  }

  async findMany(store, type, ids, snapshots, maxIds = 90) {
    const serializer = store.serializerFor(type.modelName);
    const responses = await Promise.all(chunk(ids, maxIds).map((chunkedIds) => {
      const recordsText = 'OR(' + chunkedIds.map((id) => `{${serializer.primaryKey}} = '${id}'`).join(',') + ')';
      const query = { filterByFormula: recordsText };
      if (this.fields) query.fields = this.fields;
      const url = this.buildURL(type.modelName, chunkedIds, snapshots, 'findMany');
      return this.ajax(url, 'GET', { data: query });
    }));
    return responses.reduce((acc, response) => {
      acc.records.push(...response.records);
      return acc;
    });
  }

  async findAll(_store, type, _sinceToken, snapshotRecordArray) {
    const query = this.buildQuery(snapshotRecordArray);
    const url = this.buildURL(type.modelName, null, snapshotRecordArray, 'findAll');

    const records = [];

    let res;
    do {
      query.offset = res?.offset;
      res = await this.ajax(url, 'GET', { data: query });
      records.push(...res.records);
    } while (res.offset);

    return { records };
  }

  buildQuery(snapshot) {
    const query = super.buildQuery(snapshot);

    if (snapshot.id) return query;

    if (this.fields) query.fields = this.fields;
    if (this.sort) query.sort = this.sort;

    return query;
  }

  ajax(...args) {
    return this.ajaxQueue.add(() => super.ajax(...args));
  }
}
