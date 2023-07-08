import ApplicationAdapter from './application';

export default class StaticCourseAdapter extends ApplicationAdapter {

  createRecord(store, type, snapshot) {
    const { adapterOptions } = snapshot;
    const payload = this.serialize(snapshot);
    payload.data.attributes = {};
    payload.data.attributes.name = adapterOptions.name;
    payload.data.attributes.description = adapterOptions.description;
    payload.data.attributes['challenge-ids'] = adapterOptions.challengeIds;
    const url = this.buildURL(type.modelName, snapshot.id, snapshot, 'createRecord');
    return this.ajax(url, 'POST', { data: payload });
  }
}
