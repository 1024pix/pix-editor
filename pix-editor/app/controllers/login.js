import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class LoginController extends Controller {
  @service session;

  @action
  async authenticate(apiKey) {
    await this.session.authenticate('authenticator:custom', apiKey);
  }
}
