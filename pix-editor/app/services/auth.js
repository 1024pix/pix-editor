import Service from '@ember/service';

const LOCAL_STORAGE_API_KEY = 'pix-api-key';

export default class AuthService extends Service {
  get key() {
    return localStorage.getItem(LOCAL_STORAGE_API_KEY);
  }

  set key(key) {
    localStorage.setItem(LOCAL_STORAGE_API_KEY, key);
  }
}
