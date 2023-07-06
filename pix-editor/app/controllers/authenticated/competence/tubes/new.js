import Tube from './single';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import * as Sentry from '@sentry/ember';

export default class NewController extends Tube {
  queryParams = ['themeId'];

  themeId = null;
  creation = true;

  @service currentData;
  @service loader;
  @service notify;
  @service router;
  @service store;

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
        this.notify.message('Tube créé');
      })
      .then(() => {
        this.router.transitionTo('authenticated.competence.tubes.single', competence, tube);
      })
      .catch((error) => {
        console.error(error);
        Sentry.captureException(error);
        this.loader.stop();
        this.notify.error('Erreur lors de la création du tube');
      });
  }

  @action
  async cancelEdit() {
    this.edition = false;
    this.notify.message('Création annulée');
    this.parentController.send('closeChildComponent');
    const theme = await this.tube.get('theme');
    theme.rollbackAttributes();
    this.store.deleteRecord(this.tube);
  }
}
