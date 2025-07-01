import ApplicationAdapter from './application';

export default class ThemeAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  pathForType() {
    return 'schemas';
  }
}
