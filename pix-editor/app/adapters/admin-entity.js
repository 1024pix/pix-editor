import ApplicationAdapter from './application';

export default class AdminEntityAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  pathForType() {
    return 'entities';
  }

  urlForQuery(params, type) {
    return `${this.buildURL(type)}/${params.entityName}`;
  }

  urlForCreateRecord(type, payload) {
    return `${this.buildURL(type)}/${payload.adapterOptions.entityName}`;
  }

  urlForDeleteRecord(idToDestroy, type) {
    const [entityName, entityId] = idToDestroy.split(':');
    return `${this.buildURL(type)}/${entityName}/${entityId}`;
  }
}
