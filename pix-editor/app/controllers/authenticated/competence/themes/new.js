import { action } from '@ember/object';
import { service } from '@ember/service';

import CompetenceThemesSingleController from './single';

export default class CompetenceThemesNewController extends CompetenceThemesSingleController {
  creation = true;

  @service currentData;
  @service loader;
  @service notifications;
  @service router;
  @service store;

  @action
  async save() {
    this.loader.start();
    const theme = this.theme;
    const competence = this.currentData.getCompetence();
    theme.competence = competence;
    try {
      await theme.save();
      this.edition = false;
      this.loader.stop();
      this.notifications.sendSuccess('Thématique créé');
      this.router.transitionTo('authenticated.competence.themes.single', competence, theme);
    } catch (error) {
      /* eslint-disable-next-line no-console */
      console.error(error);
      this.loader.stop();
      this.notifications.sendError('Erreur lors de la création de la thématique');
    }
  }

  @action
  cancelEdit() {
    this.edition = false;
    this.notifications.sendSuccess('Création annulée');
    this.parentController.send('closeChildComponent');
    this.store.deleteRecord(this.theme);
  }
}
