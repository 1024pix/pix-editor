import { inject as service } from '@ember/service';
import Base from 'ember-simple-auth/authenticators/base';

export default class CustomAuthenticator extends Base {
  @service store;
  @service session;

  async restore({ apiKey }) {
    await this.store.queryRecord('user', { me: true, apiKeyForAuthenticationTrial: apiKey });
    return { apiKey };
  }

  async authenticate(apiKey) {
    await this.store.queryRecord('user', { me: true, apiKeyForAuthenticationTrial: apiKey });
    sessionStorage.setItem('apiKey', apiKey);
    return { apiKey };
  }

  async invalidate() {
    sessionStorage.setItem('apiKey', null);
  }
}
