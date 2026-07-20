import { action } from '@ember/object';
import { service } from '@ember/service';

import Tube from './single';

export default class NewController extends Tube {
  queryParams = ['themeId'];

  themeId = null;
  creation = true;

  @service currentData;
  @service loader;
  @service notifications;
  @service router;
  @service store;

  @action
  close() {
    this.cancelEdit();
  }

  @action
  async save() {
    try {
      this.loader.start();
      await this.tube.save();
      this.edition = false;
      this.notifications.sendSuccess('Tube créé');
      this.router.transitionTo('authenticated.competence.tubes.single', await this.tube.competence, this.tube);
    } catch (error) {
      /* eslint-disable-next-line no-console */
      console.error(error);
      this.notifications.sendError('Erreur lors de la création du tube');
    } finally {
      this.loader.stop();
    }
  }

  @action
  async cancelEdit() {
    this.edition = false;
    this.notifications.sendSuccess('Création annulée');
    this.parentController.send('closeChildComponent');
    const theme = await this.tube.get('theme');
    theme.rollbackAttributes();
    this.store.deleteRecord(this.tube);
  }
}
