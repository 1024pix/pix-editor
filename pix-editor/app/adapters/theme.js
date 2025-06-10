import ApplicationAdapter from './application';

export default class ThemeAdapter extends ApplicationAdapter {
  coalesceFindRequests = true;

  pathForType() {
    return 'thematics';
  }
}
