import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class EditWhitelistedUrlController extends Controller {
  @service store;
  @service router;
  @service notifications;

  @action
  async editWhitelistedUrl(formData) {
    try {
      const { whitelistedUrl } = this.model;
      for (const [property, value] of Object.entries(formData)) {
        whitelistedUrl[property] = value;
      }
      await whitelistedUrl.save();
      this.notifications.success('URL modifiée avec succès.');
      this.router.transitionTo('authenticated.whitelisted-urls.list');
    } catch (err) {
      await this.notifications.error('Une erreur est survenue lors de la modification de l\'URL.');
      const knownErrors = err?.errors.map((error) => error.detail).join('\n');
      const finalErrors = knownErrors ?? JSON.stringify(err);
      throw new Error(finalErrors);
    }
  }

  @action
  async goBackToList() {
    this.router.transitionTo('authenticated.whitelisted-urls.list');
  }
}
