import ApplicationAdapter from './application';

export default class AdminEntityAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  pathForType() {
    return 'entities';
  }
}
