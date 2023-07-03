import Controller, { inject as controller } from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Sentry from '@sentry/ember';

export default class SingleController extends Controller {

  @tracked edition = false;
  @tracked displaySelectLocation = false;

  creation = false;
  wasMaximized = false;
  @controller('authenticated.competence')
  parentController;
  @service access;
  @service config;
  @service loader;
  @service notify;
  @service router;

  get tube() {
    return this.model;
  }

  get maximized() {
    return this.parentController.leftMaximized;
  }

  get mayAccessAirtable() {
    return this.access.mayAccessAirtable();
  }

  get mayEdit() {
    return this.access.mayEditSkills();
  }

  get mayMove() {
    return this.access.mayMoveTube(this.tube);
  }

  get disableSaveButton() {
    if (!this.creation) {
      return false;
    }
    return this.isEmptyMandatoryField;
  }

  get airtableUrl() {
    return `${this.config.airtableUrl}/${this.config.tableTubes}/${this.tube.id}`;
  }

  @action
  maximize() {
    this.parentController.maximizeLeft(true);
  }

  @action
  minimize() {
    this.parentController.maximizeLeft(false);
  }

  @action
  close() {
    if (this.edition) {
      this.cancelEdit();
    }
    this.parentController.send('closeChildComponent');
  }

  @action
  edit() {
    this.wasMaximized = this.maximized;
    this.send('maximize');
    this.edition = true;
  }

  @action
  cancelEdit() {
    this.edition = false;
    const tube = this.tube;
    tube.rollbackAttributes();
    const previousState = this.wasMaximized;
    if (!previousState) {
      this.send('minimize');
    }
    this.notify.message('Modification annulée');
  }

  @action
  save() {
    this.loader.start();
    const tube = this.tube;
    return tube.save()
      .then(()=> {
        this.edition = false;
        this.loader.stop();
        this.notify.message('Tube mis à jour');
        return tube.hasMany('rawSkills').reload();
      })
      .catch((error) => {
        console.error(error);
        Sentry.captureException(error);
        this.loader.stop();
        this.notify.error('Erreur lors de la mise à jour du tube');
      });
  }

  @action
  selectCompetence() {
    this.displaySelectLocation = true;
  }

  @action
  closeSelectCompetence() {
    this.displaySelectLocation = false;
  }

  @action
  setCompetence(newCompetence, newTheme) {
    const tube = this.tube;
    this.loader.start();
    tube.competence = newCompetence;
    tube.theme = newTheme;
    return tube.save()
      .then(() => {
        this.loader.stop();
        this.notify.message('Tube mis à jour');
        this.router.transitionTo('authenticated.competence.tubes.single', newCompetence, tube);
      })
      .catch((error) => {
        console.error(error);
        Sentry.captureException(error);
        this.loader.stop();
        this.notify.error('Erreur lors de la mise à jour du tube');
      });
  }
}
