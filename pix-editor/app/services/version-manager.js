import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

const V2_STORAGE_KEY = 'v2';

export default class VersionManagerService extends Service {
  @service router;
  @tracked isV2;

  constructor(properties, windowRef = window) {
    super(properties);
    this.isV2 = this.getV2(windowRef);
  }

  toggleV2(windowRef = window) {
    const newValue = !this.getV2(windowRef);
    this.isV2 = newValue;
    windowRef.localStorage.setItem(V2_STORAGE_KEY, JSON.stringify(newValue));
    this.router.refresh();
  }

  getV2(windowRef = window) {
    const stringValue = windowRef.localStorage.getItem(V2_STORAGE_KEY) ?? 'false';
    return JSON.parse(stringValue);
  }
}
