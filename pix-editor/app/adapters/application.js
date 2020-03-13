import DS from 'ember-data';
import { inject as service } from '@ember/service';

export default class ApplicationAdapter extends DS.RESTAdapter {

  host = 'https://api.airtable.com';

  @service config;

  get headers() {
    return {
      Accept: 'application/json',
      // API Token
      Authorization: 'Bearer '+this.config.airtableKey
    }
  }

  get namespace() {
  // API Version + Base ID
  return 'v0/'+this.config.airtableBase;
  }

  pathForType(type) {
    switch (type) {
      case 'challenge':
        return 'Epreuves';
      case 'skill':
        return 'Acquis';
      case 'tutorial':
        return 'Tutoriels';
      case 'tube':
        return 'Tubes';
      default:
        return super.pathForType(type);
    }
  }

  // from RESTAdpater, overriden to use PATCH instead of PUT
  updateRecord(store, type, snapshot) {
    let data = {};
    let serializer = store.serializerFor(type.modelName);

    serializer.serializeIntoHash(data, type, snapshot);

    let id = snapshot.id;
    let url = this.buildURL(type.modelName, id, snapshot, 'updateRecord');

    return this.ajax(url, 'PATCH', { data: data });
  }

  coalesceFindRequests = true;

  groupRecordsForFindMany (store, snapshots) {
    let groups = [];
    for (let i=0; i<snapshots.length; i+=100) {
      groups.push(snapshots.slice(i,i+100));
    }
    return groups;
  }

  findMany (store, type, ids, snapshots) {
    let recordsText = 'OR(' + ids.map(id => `RECORD_ID() = '${id}'`).join(',') + ')';
    let url = this.buildURL(type.modelName, ids, snapshots, 'findMany');
    return this.ajax(url, 'GET', { data: { filterByFormula: recordsText } });
  }

}
