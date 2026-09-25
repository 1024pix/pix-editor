import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class NewWhitelistedUrlController extends Controller {
  @service store;
  @service router;
  @service notifications;

  queryParams = ['url', 'skillNames', 'comment', 'from'];
  @tracked url = '';
  @tracked skillNames = '';
  @tracked comment = '';
  @tracked from;

  @action
  async createWhitelistedUrl(formData) {
    const whitelistedUrl = this.store.createRecord('whitelisted-url', formData);
    try {
      await whitelistedUrl.save();
      this.notifications.sendSuccess('URL ajoutée avec succès.');
      this.store.unloadAll('broken-url');
      await this.goBackToList();
    } catch (err) {
      whitelistedUrl.deleteRecord();
      this.notifications.sendError("Une erreur est survenue lors de l'ajout de l'URL");
      const knownErrors = err?.errors.map((error) => error.detail).join('\n');
      const finalErrors = knownErrors ?? JSON.stringify(err);
      throw new Error(finalErrors, { cause: err });
    }
  }

  @action
  goBackToList() {
    if (this.from) {
      this.router.transitionTo(this.from);
      this.from = null;
    } else {
      this.router.transitionTo('authenticated.whitelisted-urls.list');
    }
  }
}
