import Service from '@ember/service';

export default class WindowService extends Service {
  reload() {
    window.location.reload(true);
  }
}
