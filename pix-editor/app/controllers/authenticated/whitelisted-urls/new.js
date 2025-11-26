import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class NewWhitelistedUrlController extends Controller {
  @service store;
  @service router;
  @service notifications;

  @action
  async createWhitelistedUrl(formData) {
    const whitelistedUrl = this.store.createRecord('whitelisted-url', formData);
    try {
      await whitelistedUrl.save();
      this.notifications.success('URL ajoutée avec succès.');
      this.router.transitionTo('authenticated.whitelisted-urls.list');
    } catch (err) {
      whitelistedUrl.deleteRecord();
      await this.notifications.error('Une erreur est survenue lors de l\'ajout de l\'URL');
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
