import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class PopinLoginForm extends Component {

  @service config;

  @tracked apiKey;
  @tracked errorMessage;
  @tracked isErrorMessagePresent = false;

  _closeModal() {
    this.args.close();
    this.args.update();
  }

  @action
  async validateApiKey() {
    event.preventDefault();
    localStorage.setItem('pix-api-key', this.apiKey);
    try {
      await this.config.load();
      this._closeModal();
    }
    catch (error) {
      this.isErrorMessagePresent = true;
      this.errorMessage = 'La clé saisie n\'a pas pu être validée. Vérifiez votre connexion ou contactez l\'équipe de développement.';
      if (this._isUnauthorizedError(error)) {
        localStorage.removeItem('pix-api-key');
        this.errorMessage = 'La clé saisie n\'est pas valide. Vérifiez votre saisie.';
      }
    }
  }

  _isUnauthorizedError(error) {
    return error && error.errors && error.errors[0] && error.errors[0].code === 401;
  }
}
