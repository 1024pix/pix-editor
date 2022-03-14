import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

const LOCAL_STORAGE_API_KEY = 'pix-api-key';

export default class AuthService extends Service {
  @tracked connected = false;

  get key() {
    return localStorage.getItem(LOCAL_STORAGE_API_KEY);
  }

  set key(key) {
    if (key) {
      localStorage.setItem(LOCAL_STORAGE_API_KEY, key);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_API_KEY);
    }
  }
}
