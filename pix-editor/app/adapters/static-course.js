import ApplicationAdapter from './application';

export default class StaticCourseAdapter extends ApplicationAdapter {

  createRecord(store, type, snapshot) {
    const payload = preparePayloadForCreateAndUpdate(this.serialize(snapshot), snapshot.adapterOptions);
    const url = this.buildURL(type.modelName, snapshot.id, snapshot, 'createRecord');
    return this.ajax(url, 'POST', { data: payload });
  }

  updateRecord(store, type, snapshot) {
    const action = snapshot.adapterOptions.action;
    if (action === 'update') {
      const payload = preparePayloadForCreateAndUpdate(this.serialize(snapshot), snapshot.adapterOptions);
      const url = this.buildURL(type.modelName, snapshot.id, snapshot, 'updateRecord');
      return this.ajax(url, 'PUT', { data: payload });
    }
    if (action === 'deactivate') {
      const url = this.buildURL(type.modelName, snapshot.id, snapshot, 'updateRecord');
      return this.ajax(`${url}/deactivate`, 'PUT');
    }
    return super.updateRecord(store, type, snapshot);
  }
}

function preparePayloadForCreateAndUpdate(payload, adapterOptions) {
  payload.data.attributes = {};
  payload.data.attributes.name = adapterOptions.name;
  payload.data.attributes.description = adapterOptions.description;
  payload.data.attributes['challenge-ids'] = adapterOptions.challengeIds;
  return payload;
}
