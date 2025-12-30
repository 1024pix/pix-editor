import ApplicationAdapter from './application';

export default class AdminSchemaAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  pathForType() {
    return 'schemas';
  }
}
