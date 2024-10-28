import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class NewWhitelistedUrlController extends Controller {
  @service store;
  @service router;
  @service notifications;

  @action
  async createWhitelistedUrl(formData) {
    const whitelistedUrl = this.store.createRecord('whitelisted-url', formData);
    try {
      await whitelistedUrl.save();
      this.notifications.success('URL ajoutée à la whitelist avec succès.');
      this.router.transitionTo('authenticated.whitelisted-urls.list');
    } catch (err) {
      const errorDetail = err?.errors?.[0]?.detail ?? err;
      whitelistedUrl.deleteRecord();
      await this.notifications.error('Une erreur est survenue lors de l\'ajout de l\'URL à la whitelist');
      throw new Error(errorDetail);
    }
  }

  @action
  async goBackToList() {
    this.router.transitionTo('authenticated.whitelisted-urls.list');
  }
}
