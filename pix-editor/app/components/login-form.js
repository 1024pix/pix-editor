import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class LoginForm extends Component {
  apiKey = null;
  @tracked isErrorMessagePresent = false;
  @tracked errorMessage = null;

  @action
  setApiKey(event) {
    this.apiKey = event.target.value;
  }

  @action
  async logInClicked(event) {
    event.preventDefault();
    this.isErrorMessagePresent = false;
    try {
      await this.args.onLogInClicked(this.apiKey);
    } catch (error) {
      this.isErrorMessagePresent = true;
      this.errorMessage = 'La clé saisie n\'a pas pu être validée ou n\'est pas valide. Vérifiez votre connexion, votre saisie ou contactez l\'équipe de développement.';
    }
  }
}
