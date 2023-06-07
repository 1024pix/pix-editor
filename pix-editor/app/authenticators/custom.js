import Base from 'ember-simple-auth/authenticators/base';
import { inject as service } from '@ember/service';

export default class CustomAuthenticator extends Base {
  @service auth;
  @service store;

  async restore() {
    try {
      await this.store.queryRecord('user', { me: true });
      this.auth.connected = true;
    } catch(_) {
      this.auth.key = undefined;
      this.auth.connected = false;
    }
  }

  async authenticate(apiKey) {
    this.auth.key = apiKey;
    await this.store.queryRecord('user', { me: true });
    this.auth.connected = true;
    return 'authentication_ok';
  }

  async invalidate() {
    this.auth.key = undefined;
    this.auth.connected = false;
  }
}
