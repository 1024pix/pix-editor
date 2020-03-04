import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { inject as controller } from '@ember/controller';
import {scheduleOnce} from '@ember/runloop';
import {tracked} from '@glimmer/tracking';

export default class SingleController extends Controller {

  @tracked edition = false;
  @tracked displaySelectLocation = false;
  @tracked areas = null;
  @tracked competence = null;

  creation = false;
  wasMaximized = false;

  @alias('model')
  tube;

  @controller
  application;

  @controller('competence')
  parentController;

  @alias('parentController.firstMaximized')
  maximized;

  @service access;
  @service config;

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
    if(tubeData){
      tubeData.scrollTop = 0;
    }
  }

  @action
  maximize() {
    this.maximized = true;
  }

  @action
  minimize() {
    this.maximized = false;
  }

  @action
  close() {
    this.maximized = false;
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
    let tube = this.tube;
    tube.rollbackAttributes();
    let previousState = this.wasMaximized;
    if (!previousState) {
      this.send('minimize');
    }
    this.application.send('showMessage', 'Modification annulée', true);
  }

  @action
  save() {
    this.application.send('isLoading');
    let tube = this.tube;
    return tube.save()
    .then(()=> {
      this.edition = false;
      this.application.send('finishedLoading');
      this.application.send('showMessage', 'Tube mis à jour', true);
      return tube.hasMany('rawSkills').reload();
    })
    .catch((error) => {
      console.error(error);
      this.application.send('finishedLoading');
      this.application.send('showMessage', 'Erreur lors de la mise à jour du tube', true);
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
    let tube = this.tube;
    this.application.send('isLoading');
    tube.competence = newCompetence;
    return tube.save()
    .then(() => {
      this.application.send('finishedLoading');
      this.application.send('showMessage', 'Tube mis à jour', true);
      this.transitionToRoute('competence.tubes.single', newCompetence, tube);
    })
    .catch((error) => {
      console.error(error);
      this.application.send('finishedLoading');
      this.application.send('showMessage', 'Erreur lors de la mise à jour du tube', true);
    });
  }
}
