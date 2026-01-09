import ApplicationAdapter from './application';

export default class AdminEntityAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  pathForType() {
    return 'entities';
  }

  urlForQuery(params, type) {
    return `${this.buildURL(type)}/${params.entityName}`;
  }
}
