import Service, { inject as service } from '@ember/service';

export default class VersionManagerService extends Service {
  @service router;

  isV2() {
    return JSON.parse(window.localStorage.getItem('version-toggle')) ?? false;
  }

  setVersion(isVersionToggled) {
    window.localStorage.setItem('version-toggle', JSON.stringify(isVersionToggled));
    this.router.refresh();
  }
}
