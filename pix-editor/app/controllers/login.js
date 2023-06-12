import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class LoginController extends Controller {
  @service session;

  @action
  async authenticate(apiKey) {
    await this.session.authenticate('authenticator:custom', apiKey);
  }
}
