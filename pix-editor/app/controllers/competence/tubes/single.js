import Controller, { inject as controller } from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { scheduleOnce } from '@ember/runloop';
import { tracked } from '@glimmer/tracking';
import Sentry from '@sentry/ember';

export default class SingleController extends Controller {

  @tracked edition = false;
  @tracked displaySelectLocation = false;

  creation = false;
  wasMaximized = false;

  get tube() {
    return this.model;
  }

  @controller('competence')
  parentController;

  get maximized() {
    return this.parentController.leftMaximized;
  }

  @service access;
  @service config;
  @service notify;
  @service loader;

  get mayAccessAirtable() {
    return this.access.mayAccessAirtable();
  }

  get mayEdit() {
    return this.access.mayEditSkills();
  }

  get mayMove() {
    return this.access.mayMoveTube(this.tube);
  }

  _scrollToTop() {
    const tubeData = document.querySelector('.tube-data');
    if (tubeData) {
      tubeData.scrollTop = 0;
    }
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
    this.parentController.send('closeChildComponent');
  }

  @action
  edit() {
    this.wasMaximized = this.maximized;
    this.send('maximize');
    this.edition = true;
    scheduleOnce('afterRender', this, this._scrollToTop);
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
  openAirtable() {
    window.open(`${this.config.airtableUrl}${this.config.tableTubes}/${this.tube.id}`, 'airtable');
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
  setCompetence(newCompetence) {
    const tube = this.tube;
    this.loader.start();
    tube.competence = newCompetence;
    return tube.save()
      .then(() => {
        this.loader.stop();
        this.notify.message('Tube mis à jour');
        this.transitionToRoute('competence.tubes.single', newCompetence, tube);
      })
      .catch((error) => {
        console.error(error);
        Sentry.captureException(error);
        this.loader.stop();
        this.notify.error('Erreur lors de la mise à jour du tube');
      });
  }
}
