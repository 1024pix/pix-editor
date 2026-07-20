import Controller, { inject as controller } from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class SingleController extends Controller {
  @tracked edition = false;
  @tracked displaySelectLocation = false;

  creation = false;
  wasMaximized = false;

  get tube() {
    return this.model;
  }

  @controller('authenticated.competence')
  parentController;

  get maximized() {
    return this.parentController.leftMaximized;
  }

  @service access;
  @service loader;
  @service notifications;
  @service router;

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
    this.notifications.sendSuccess('Modification annulée');
  }

  @action
  save() {
    this.loader.start();
    const tube = this.tube;
    return tube
      .save()
      .then(() => {
        this.edition = false;
        this.loader.stop();
        this.notifications.sendSuccess('Tube mis à jour');
        return tube.hasMany('rawSkills').reload();
      })
      .catch((error) => {
        /* eslint-disable-next-line no-console */
        console.error(error);
        this.loader.stop();
        this.notifications.sendError('Erreur lors de la mise à jour du tube');
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
    return tube
      .save()
      .then(() => {
        this.loader.stop();
        this.notifications.sendSuccess('Tube mis à jour');
        this.router.transitionTo('authenticated.competence.skills', newCompetence.id);
      })
      .catch((error) => {
        /* eslint-disable-next-line no-console */
        console.error(error);
        this.loader.stop();
        this.notifications.sendError('Erreur lors de la mise à jour du tube');
      });
  }
}
