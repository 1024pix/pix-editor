import Tube from './single';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Sentry from '@sentry/ember';

export default class NewController extends Tube {
  queryParams = ['themeId'];

  themeId = null;
  creation = true;

  @service currentData;
  @service notify;
  @service loader;

  @action
  close() {
    this.cancelEdit();
  }

  @action
  save() {
    this.loader.start();
    const tube = this.tube;
    const competence = this.currentData.getCompetence();
    tube.competence = competence;
    return tube.save()
      .then(() => {
        this.edition = false;
        this.loader.stop();
        this.notify.message('Sujet créé');
      })
      .then(() => {
        this.transitionToRoute('competence.tubes.single', competence, tube);
      })
      .catch((error) => {
        console.error(error);
        Sentry.captureException(error);
        this.loader.stop();
        this.notify.error('Erreur lors de la création du sujet');
      });
  }

  @action
  async cancelEdit() {
    const theme = await this.tube.get('theme');
    theme.rollbackAttributes();
    this.store.deleteRecord(this.tube);
    this.edition = false;
    this.notify.message('Création annulée');
    this.parentController.send('closeChildComponent');
  }
}
