import Controller from "@ember/controller";
import { inject as service } from "@ember/service";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";

export default class LoginController extends Controller {
  @tracked errorMessage;
  @tracked isErrorMessagePresent;
  @service session;
  apiKey;

  @action
  async authenticate(e) {
    e.preventDefault();
    this.isErrorMessagePresent = false;
    try {
      await this.session.authenticate("authenticator:custom", this.apiKey);
    } catch (error) {
      this.isErrorMessagePresent = true;
      this.errorMessage = 'La clé saisie n\'a pas pu être validée ou n\'est pas valide. Vérifiez votre connexion, votre saisie ou contactez l\'équipe de développement.';
    }
  }
}
