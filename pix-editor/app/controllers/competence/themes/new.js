import CompetenceThemesSingleController from './single';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Sentry from '@sentry/ember';

export default class CompetenceThemesNewController extends CompetenceThemesSingleController {

  creation = true;

  @service currentData;
  @service notify;
  @service loader;

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
      this.notify.message('Thématique créé');
      this.transitionToRoute('competence.themes.single', competence, theme);
    } catch (error) {
      console.error(error);
      Sentry.captureException(error);
      this.loader.stop();
      this.notify.error('Erreur lors de la création de la thématique');
    }
  }

  @action
  cancelEdit() {
    this.store.deleteRecord(this.theme);
    this.edition = false;
    this.notify.message('Création annulée');
    this.parentController.send('closeChildComponent');
  }
}
