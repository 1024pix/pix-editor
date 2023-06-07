import Base from 'ember-simple-auth/authenticators/base';
import { inject as service } from '@ember/service';

export default class CustomAuthenticator extends Base {
  @service store;
  @service session;

  async restore() {
    // TODO récup depuis le storage ? stocker correctement dans storage ?
    const apiKey = this.session.data.authenticated.apiKey;
    return this.store.queryRecord('user', { me: true, apiKeyForAuthenticationTrial: apiKey });
  }

  async authenticate(apiKey) {
    await this.store.queryRecord('user', { me: true, apiKeyForAuthenticationTrial: apiKey });
    return { apiKey };
  }
}
