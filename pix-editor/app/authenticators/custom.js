import Base from 'ember-simple-auth/authenticators/base';
import { inject as service } from '@ember/service';

export default class CustomAuthenticator extends Base {
  @service store;

  restore() {
    return this.store.queryRecord('user', { me: true });
  }

  async authenticate(apiKey) {
    await this.store.queryRecord('user', { me: true, apiKeyForAuthenticationTrial: apiKey });
    return { apiKey };
  }
}
