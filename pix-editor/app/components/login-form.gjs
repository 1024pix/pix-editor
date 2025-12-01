import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
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
    } catch {
      this.isErrorMessagePresent = true;
      this.errorMessage =
        "La clé saisie n'a pas pu être validée ou n'est pas valide. Vérifiez votre connexion, votre saisie ou contactez l'équipe de développement.";
    }
  }

  <template>
    <div class="login">

      <header class="login__header">
        <img src="/assets/images/elephant_login.svg" alt="Pix Editor" />

        <h1 class="login-header__title">Connectez-vous</h1>

        <p class="login-header__information paragraph">
          Pour vous identifier, merci de saisir votre clé personnelle.
        </p>
      </header>

      <main class="login__main">

        <form class="login-main__form" {{on "submit" this.logInClicked}}>

          <PixInput
            @id="login-api-key"
            name="login"
            @requiredLabel="Champ obligatoire"
            {{on "input" this.setApiKey}}
          ><:label>Clé API</:label></PixInput>

          {{#if this.isErrorMessagePresent}}
            <div class="ui negative message" id="login-form-error-message">
              <p>{{this.errorMessage}}</p>
            </div>
          {{/if}}

          <PixButton @type="submit">
            Se connecter
          </PixButton>
        </form>
      </main>
    </div>
  </template>
}
