import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class SynchronizeTranslationsController extends Controller {
  @service notifications;

  @action
  async importFromPhrase() {
    try {
      await this.model.download();
      this.notifications.success('Téléchargement des traductions depuis Phrase effectué.');
    } catch {
      this.notifications.error('Erreur lors du téléchargement des traductions.');
    }
  }
}
