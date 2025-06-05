import ApplicationAdapter from './application';

export default class TutorialAdapter extends ApplicationAdapter {
  updateRecord(store, type, snapshot) {
    const data = this.serialize(snapshot, { includeId: true });
    const id = snapshot.id;
    const url = this.buildURL(type.modelName, id, snapshot, 'updateRecord');

    return this.ajax(url, 'PUT', { data });
  }
}
